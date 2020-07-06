# react-native-withdrawals
A bank withdrawal reporting component for react-native

## Install

```bash
npm install --save https://github.com/codificar/react-native-withdrawals.git
```

## Usage

```javascript

import WithdrawalsReport from "react-native-withdrawals";

// ...
this.state = {
  formattedBalance: "R$90,00",
  withdrawals: [
    {
	  bank: "Bradesco",
	  formattedValue: "R$54,90",
	  date: "2020-12-03 10:50:20",
	  bankAccount: "481415"
	},
	{
	  bank: "Caixa",
	  formattedValue: "R$10,50",
	  date: "2019-05-15 22:32:10",
	  bankAccount: "98564"
	}
	  // ...
	]
	
};
// ...
<WithdrawalsReport
  withdrawals={this.state.withdrawals}
  formattedBalance={this.state.formattedBalance}
/>
// ...
}

```

## Properties

| Prop  | Default  | Type | Description |
| :------------ |:---------------:| :---------------:| :-----|
| withdrawals | - | `object` | array of objects in this format: { bank: "String", formattedValue: "String", date: "YYYY-MM-DDDD HH:mm:ss", bankAccount: "String" } |
| formattedBalance | - | `string` | Balance with the value already formatted |