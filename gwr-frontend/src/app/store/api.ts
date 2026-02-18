// frontend/app/api/api.ts
export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type RequestOptions = RequestInit & {
  auth?: boolean; // 쿠키 포함 여부
  headers?: Record<string, string>; // 추가 헤더
  isFormData?: boolean; // FormData 여부
  useAuth?: boolean; // 추가
};

export const apiFetch = async (url: string, options: RequestOptions = {}) => {
  const { auth, headers, isFormData, useAuth, ...fetchOptions } = options;

  // 공통 Authorization 헤더 처리
  const AuthHeader: Record<string, string> = {};
  if (!isFormData) AuthHeader['Content-Type'] = 'application/json';
  if (useAuth) {
    const token = localStorage.getItem('accessToken');
    if (token) AuthHeader['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    ...fetchOptions,
    credentials: auth ? 'include' : 'same-origin',
    headers: {
      ...AuthHeader,
      ...headers,
    },
  });

  // Content-Type 체크 후 JSON 파싱
  const contentType = res.headers.get('Content-Type') || '';
  let data: any = null;
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  }

  if (!res.ok) {
    const message = data?.resultMessage || res.statusText || 'API 요청 실패';
    throw new Error(message);
  }

  return data;
};
