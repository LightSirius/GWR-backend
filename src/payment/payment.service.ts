import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentList, PaymentType } from './entities/payment-list.entity';
import { Connection, EntityManager, Repository } from 'typeorm';
import { PaymentPortone } from './entities/payment-portone.entity';
import { CreatePaymentPortoneDto } from './dto/create-payment-portone.dto';
import { CreatePaymentPaypalDto } from './dto/create-payment-paypal.dto';
import { UserService } from '../user/user.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  private readonly BILLING_API_URL =
    this.configService.getOrThrow('BILLING_API_URL');

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(PaymentList)
    private paymentListRepository: Repository<PaymentList>,
    @InjectRepository(PaymentPortone)
    private paymentPortoneRepository: Repository<PaymentPortone>,
    private readonly entityManager: EntityManager,
    private readonly connection: Connection,
    private readonly userService: UserService,
    private readonly httpService: HttpService,
  ) {}
  async create(body: CreatePaymentPortoneDto | CreatePaymentPaypalDto) {
    const queryRunner = await this.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      switch (body.payment_type) {
        case PaymentType.portone: {
          const paymentPortone = new PaymentPortone({
            ...body,
          });
          await this.paymentPortoneRepository.save(paymentPortone);

          const paymentList = new PaymentList({
            payment_uuid: paymentPortone.payment_uuid,
            ...body,
          });
          console.log(paymentList);
          await this.paymentListRepository.save(paymentList);

          return paymentList.payment_uuid;
        }
        default: {
          throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        }
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getPaymentLists(user_uuid: string) {
    return await this.paymentListRepository.findBy({ user_uuid });
  }

  async getBillingModule(guard: { uuid: string }) {
    const user = await this.userService.findOne(guard.uuid);

    const req = await this.httpService
      .request({
        baseURL: this.BILLING_API_URL + 'ci_enc.asp',
        method: 'POST',
        data: 'IPIN_ID_NO=' + user.user_ci,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      })
      .toPromise();

    return { game_uuid: user.member_uuid, key: req.data };
  }
}
