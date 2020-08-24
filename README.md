# react-native-withdrawals
A bank withdrawal reporting component for react-native

## Install

```bash
add in package.json:
"react-native-withdrawals": "git+https://libs:ofImhksJ@git.codificar.com.br/react-components/react-native-withdrawals.git",
```

## Usage
works well with: https://git.codificar.com.br/laravel-libs/laravel-withdrawals

```javascript

import WithdrawalsReport from "react-native-withdrawals";

<WithdrawalsReport
	route={'localhost:8000/libs/withdrawals/report'}
	providerId={this.state.providerId}
	token={this.state.token}
/>


```

## Properties

| Prop  | Default  | Type | Description |
| :------------ |:---------------:| :---------------:| :-----|
| route | '' | `string` | rota para pegar o relatorio de saques|
| providerId | - | `number` | id do prestador |
| providerId | - | `string` | token do prestador |