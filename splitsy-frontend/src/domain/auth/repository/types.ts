interface LoginBody {
  username: string;
  password: string;
}

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginParams {
  body: LoginBody;
}

export interface RegisterParams {
  body: RegisterBody;
}
