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
                date: "2020-12-03 HH:mm:ss",
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
                        date: "2020-12-03 HH:mm:ss",
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
        //Pega todos os anos-meses no formato: 'YYYY-MM' para depois agrupar os que sao do mesmo mes
        //Get all years-months in format 'YYYY-MM' because after we will agroup the same year/month
        var yearsMonths = [];
        var newArray = [];
        for(let i=0; i < aux.length; i++) {
            //get the year and the month
            var currentYearMonth = moment(aux[i].date, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM");
            var arrayPosition = yearsMonths.indexOf(currentYearMonth);

            var dataFormatted = {
                bank: aux[i].bank,
                formattedValue: aux[i].formattedValue,
                date: moment(aux[i].date, "YYYY-MM-DD HH:mm:ss").format("ddd, D MMM"),
                bankAccount: aux[i].bankAccount,
            }
            
            //Check if exists this year/month in array
            if(arrayPosition === -1) {
                //Add the year-month in yearsMonths array that contain all unique years-months
                yearsMonths.push(currentYearMonth);

                //Push the new array
                newArray[i] = {
                    title: moment(currentYearMonth, "YYYY-MM").format("MMMM YYYY"),
                    withdrawals: [ dataFormatted ]
                }
            }
            //If alredy exists the currentYearMonth, so just add the withdrawal in this year-month
            else {
                //add the withdrawal in this year-month
                newArray[arrayPosition].withdrawals.push(dataFormatted);
            }
        }
        console.log("novo array: ", newArray);
		this.setState({
            withdrawals: newArray
        });
    }

    render() {       
     
        return (
            <View style={styles.body}>

                {/* Flex vertical of 1/10 */}
                <View style={{flex: 0.5, backgroundColor: "white"}}>
                    <Text style={{fontSize: 20, padding: 20, fontWeight: "bold"}}>X</Text>
                </View>

                {/* Flex vertical of 2/10 */}
                {/* <View style={{flex: 2, backgroundColor: "white",  justifyContent: 'center', alignItems: 'center'}}>
                    <Text>Saldo atual: {this.props.formattedBalance}</Text>
                    <Button
                        title="Solicitar saque"
                        accessibilityLabel="Solicitar saque"
                        color="blue"
                    />
                </View> */}

                {this.state.withdrawals && this.state.withdrawals.length > 0 ? (
                    <View style={{flex: 7}}>{/* Flex vertical of 7/10 */}
                        {console.log("primeiro flatlist: ", this.state.withdrawals)}
                        <FlatList
                            data={this.state.withdrawals}
                            keyExtractor={(x, i) => i.toString()}
                            renderItem={({ item, index }) => (
                                
                                <View>
                                    {item.title && item.withdrawals.length > 0 ? (
                                        <View>
                                            <Text style={{padding: 15, fontWeight: "bold", fontSize: 23}}>{item.title}</Text>
                                            
                                            <FlatList
                                                data={item.withdrawals}
                                                keyExtractor={(x, i) => i.toString()}
                                                renderItem={({ item, index }) => (

                                                    <View style={{padding: 5, flexDirection: "row"}}>

                                                        {/* Flex horizontal of 1/8 */}
                                                        <View style={{ flex: 1, backgroundColor:"white", justifyContent: 'center', alignItems: 'center' }}>
                                                            <Image style={{flex: 1, width: 30, height: 30, resizeMode: 'contain'}} source={require('./bank-profile.png')} />
                                                        </View>
                                                        
                                                        {/* Flex horizontal of 7/8 */}
                                                        <View style={{flex: 7}}>
                                                            {/* Flex horizontal */}
                                                            <View style={{flexDirection: "row"}}>
                                                                {/* Flex horizontal of 5/7 */}
                                                                <View style={{ flex: 5, backgroundColor:"white"}}>
                                                                    <Text style={{fontWeight: "bold", color: "black", fontSize: 15}}>Transação</Text>
                                                                    <Text style={{color: "#C4C4C4"}}>{item.date}</Text>
                                                                    <Text style={{color: "#C4C4C4"}}>Banco: {item.bank} - {item.bankAccount}</Text>
                                                                </View>

                                                                {/* Flex horizontal of 2/7 */}
                                                                <View style={{ flex: 2, backgroundColor: "white", justifyContent: 'center', alignItems: 'center' }}>
                                                                    <Text style={{color: "black", fontWeight: "bold", fontSize: 18}}>{item.formattedValue}</Text>
                                                                </View>
                                                            </View>
                                                            <View style={styles.hr}></View>
                                                        </View>
                                                        
                                                    </View>
                                                )}
                                            />
                                        </View>
                                    ) : ( 
                                        null 
                                    )}
                                </View>
                            )}
                        />
                    </View>
                ) : ( 
                    null 
                )}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    body: {
        flex: 1, 
        backgroundColor: 'white'
    },
    hr: {
        paddingVertical: 5, 
        borderBottomWidth: 0.5,
        borderBottomColor: '#C4C4C4'
    }
});

export default WithdrawalsReport;