import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType } from 'redis';
import * as crypto from 'crypto';
import { createRandomString } from '../utils/utill';
import axios from 'axios';
import { NiceCheckDto, NiceCheckType } from './dto/nice-check.dto';

@Injectable()
export class NiceService {
  private readonly NICE_ACCESS_TOKEN =
    this.configService.getOrThrow('NICE_ACCESS_TOKEN');
  private readonly NICE_CLIENT_ID =
    this.configService.getOrThrow('NICE_CLIENT_ID');
  private readonly NICE_API_URL = this.configService.getOrThrow('NICE_API_URL');
  private readonly NICE_PRODUCT_ID =
    this.configService.getOrThrow('NICE_PRODUCT_ID');
  private readonly NICE_RETURN_URL_REGISTER = this.configService.getOrThrow(
    'NICE_RETURN_URL_REGISTER',
  );
  private readonly NICE_RETURN_URL_MODIFY = this.configService.getOrThrow(
    'NICE_RETURN_URL_MODIFY',
  );

  constructor(
    private readonly configService: ConfigService,
    @Inject('REDIS_CLIENT')
    private readonly redis: RedisClientType,
  ) {}

  encrypt(data: string, key: string, iv: string) {
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  }

  decrypt(enc_data, key, iv) {
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    // const decrypted = decipher.update(enc_data, 'base64');
    // return decrypted.toString('base64') + decipher.final();
    let res: string = '';
    res += decipher.update(enc_data, 'base64');
    res += decipher.final();
    return JSON.parse(Buffer.from(res).toString());
  }

  checkTypeToReturnURL(niceCheckType: NiceCheckType) {
    switch (niceCheckType) {
      case NiceCheckType.modify: {
        return this.NICE_RETURN_URL_MODIFY;
      }
      case NiceCheckType.register: {
        return this.NICE_RETURN_URL_REGISTER;
      }
    }
  }

  async checkPlus(niceCheckDto: NiceCheckDto) {
    console.log(niceCheckDto);
    const now = new Date();

    const returnURL = this.checkTypeToReturnURL(niceCheckDto.niceCheckType);
    console.log(returnURL);
    const timestamp = Math.floor(now.getTime() / 1000);
    const Auth =
      this.NICE_ACCESS_TOKEN + ':' + timestamp + ':' + this.NICE_CLIENT_ID;
    const base64_Auth = Buffer.from(Auth).toString('base64');

    const req_dtim = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;

    const req_no = 'NICE' + req_dtim + createRandomString(10);
    console.log(req_no);

    const url =
      this.NICE_API_URL + '/digital/niceid/api/v1.0/common/crypto/token';
    const data = {
      dataHeader: {
        CNTY_CD: 'ko',
      },
      dataBody: {
        req_dtim: req_dtim,
        req_no: req_no,
        enc_mode: '1',
      },
    };
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'bearer ' + base64_Auth,
      'productID ': this.NICE_PRODUCT_ID,
    };

    const response = await axios.post(url, data, { headers });

    const sitecode = response.data.dataBody.site_code;
    const token_version_id = response.data.dataBody.token_version_id;
    const token_val = response.data.dataBody.token_val;

    const result = req_dtim + req_no + token_val;
    const resultVal = crypto
      .createHash('sha256')
      .update(result)
      .digest('base64');

    const key = resultVal.substr(0, 16);
    const iv = resultVal.substr(resultVal.length - 16, resultVal.length - 1);
    const hmac_key = resultVal.substr(0, 32);

    const plain_data = {
      requestno: req_no,
      returnurl: returnURL,
      sitecode: sitecode,
    };

    const plain = JSON.stringify(plain_data);
    const enc_data = this.encrypt(plain, key, iv);

    const hmac = crypto.createHmac('sha256', hmac_key);
    const integrity = hmac.update(enc_data).digest('base64');

    await this.redis.setEx(
      'nice_api_data:' + token_version_id,
      3600,
      resultVal,
    );

    return {
      token_version_id: token_version_id,
      enc_data: enc_data,
      integrity_value: integrity,
    };
  }
}
