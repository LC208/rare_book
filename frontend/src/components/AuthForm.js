import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';

const AuthForm = ({ onSubmit, formType }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password, firstName, lastName });
  };

  return (
    <Form onFinish={handleSubmit}>
      {formType === 'register' && (
        <>
          <Form.Item name="firstName" label="First Name">
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name">
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </Form.Item>
        </>
      )}
      <Form.Item name="email" label="Email">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </Form.Item>
      <Form.Item name="password" label="Password">
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {formType === 'register' ? 'Register' : 'Login'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AuthForm;