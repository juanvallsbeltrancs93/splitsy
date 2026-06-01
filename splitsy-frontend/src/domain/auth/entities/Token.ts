export interface TokenProps {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export class Token {
  public readonly accessToken: string;
  public readonly refreshToken: string;
  public readonly tokenType: string;

  constructor(props: TokenProps) {
    this.accessToken = props.accessToken;
    this.refreshToken = props.refreshToken;
    this.tokenType = props.tokenType;
  }

  public static create(props: TokenProps): Token {
    return new Token({
      accessToken: props.accessToken,
      refreshToken: props.refreshToken,
      tokenType: props.tokenType,
    });
  }
}
