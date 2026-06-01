export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface TokenResponseDto {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponseDto {
  id: string;
  name: string;
  email: string;
}
