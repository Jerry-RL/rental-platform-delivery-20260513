import type { FormEvent } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

type Props = {
  phone: string;
  password: string;
  onPhoneChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRegister: (event: FormEvent) => void;
  onLogin: () => void;
};

export function AuthPanel(props: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>注册与登录</CardTitle>
        <CardDescription>用于快速联调用户注册及鉴权登录。</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]" onSubmit={props.onRegister}>
          <Input value={props.phone} onChange={(event) => props.onPhoneChange(event.target.value)} placeholder="手机号" />
          <Input value={props.password} onChange={(event) => props.onPasswordChange(event.target.value)} placeholder="密码" type="password" />
          <Button type="submit">注册</Button>
          <Button type="button" variant="secondary" onClick={props.onLogin}>
            登录
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
