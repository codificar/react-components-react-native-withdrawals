import React, { Component } from 'react';
import { 
    View, 
    TouchableOpacity, 
    Text, 
    FlatList, 
    StyleSheet, 
    Image,
    Button
} from "react-native";

//Moment date
import moment from "moment";
import IImageConverter from 'react-native-image-converter'


class WithdrawalsReport extends Component {

    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
            content: "",
            withdrawals: []
        }
    }

    componentDidMount() {
        this.convertWithdrawalsFormat();
    }

    /**
     * function to convert the format   
     * 
     * EXAMPLE THE PROPS BEFORE CONVERT
        [
            {
                bank: "Bradesco",
                formattedValue: "R$54,90",
                date: "2020/12/03",
                bankAccount: "481415"
            },
            {
                ...
            }
        ]

        ****************
        * EXAMPLE RESULT AFTER CONVERT
        [
            {
                title: "Janeiro 2020",
                withdrawals: [
                    {
                        bank: "Bradesco",
                        formattedValue: "R$54,90",
                        date: "2020/12/03",
                        bankAccount: "481415"
                    },
                    {
                        ...
                    }
                ],
            },
            {
                ...
            }
        ]

     */
    convertWithdrawalsFormat() {
        var aux = this.props.withdrawals;
        for(let i=0; i < aux.length; i++) {
            
        }
		this.setState({
            withdrawals: this.props.withdrawals
        });
    }

    render() {       
     
        return (
            <View style={styles.body}>

                {/* Flex vertical of 1/10 */}
                <View style={{flex: 1, backgroundColor: "blue"}}>
                    <Text style={{fontSize: 20, padding: 20, fontWeight: "bold"}}>X</Text>
                </View>

                {/* Flex vertical of 2/10 */}
                <View style={{flex: 2, backgroundColor: "yellow",  justifyContent: 'center', alignItems: 'center'}}>
                    <Text>Saldo atual: {this.props.formattedBalance}</Text>
                    <Button
                        title="Solicitar saque"
                        accessibilityLabel="Solicitar saque"
                        color="gray"
                    />
                </View>

                {/* Flex vertical of 7/10 */}
                <View style={{flex: 7}}>
                    <FlatList
                        data={this.state.withdrawals}
                        keyExtractor={(x, i) => i.toString()}
                        renderItem={({ item, index }) => (
                            <View style={{padding: 5, flexDirection: "row"}}>

                                {/* Flex horizontal of 1/8 */}
                                <View style={{ flex: 1, backgroundColor:"white", justifyContent: 'center', alignItems: 'center' }}>
                                    <Image source={this.props.bankIcon}/>
                                </View>
                                
                                 {/* Flex horizontal of 7/8 */}
                                <View style={{flex: 7}}>
                                    {/* Flex horizontal */}
                                    <View style={{flexDirection: "row"}}>
                                        {/* Flex horizontal of 5/7 */}
                                        <View style={{ flex: 5, backgroundColor:"gray"}}>
                                            <Text style={{fontWeight: "bold"}}>Transação</Text>
                                            <Text>{item.date}</Text>
                                            <Text>Banco: {item.bank} - {item.bankAccount}</Text>
                                        </View>

                                        {/* Flex horizontal of 2/7 */}
                                        <View style={{ flex: 2, backgroundColor: "purple", justifyContent: 'center', alignItems: 'center' }}>
                                            <Text>{item.formattedValue}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.hr}></View>
                                </View>
                                
                            </View>
                        )}
                    />
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    body: {
        flex: 1, 
        backgroundColor: 'red'
    },
    hr: {
        paddingVertical: 5, 
        borderBottomWidth: 1,
        borderBottomColor: 'blue'
    }
});

export default WithdrawalsReport;