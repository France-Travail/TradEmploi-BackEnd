export interface AccessTokenResponse {
  access_token: string;
  refresh_token: string;
  scope: string;
  id_token: string;
  token_type: string;
  expire_in: number;
  nonce: string;
}


