import React, { Component } from 'react';
import { 
    View, 
    TouchableOpacity, 
    Text, 
    FlatList, 
    StyleSheet, 
    Image
} from "react-native";

//Moment date
import moment from "moment";

class ReportWithdraw extends Component {

    constructor(props) {
        super(props);
        this.state = {
            withdrawals: []
        }


        //Get the lang from props. If hasn't lang in props, default is pt-BR
        this.strings = require('./langs/pt-BR.json');
        if(this.props.lang) {
            if(this.props.lang == "pt-BR") {
                this.strings = require('./langs/pt-BR.json');
            } 
            // if is english
            else if(this.props.lang.indexOf("en") != -1) {
                this.strings = require('./langs/en.json');
            }
        }
    }

    componentDidMount() {
        //Get the summary report
        this.getWithdrawalsReport();
    }

    getWithdrawalsReport() {
        fetch(this.props.urlReport,{
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                provider_id: this.props.providerId,
                token: this.props.providerToken
            })
        })
        .then((response) => response.json())
        .then((json) => {

            this.convertWithdrawalsFormat(json.withdrawals_report);
        })
        .catch((error) => {
            console.error(error);
        });
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
                bankAccount: "481415",
                type: "Solicitado"
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
                        bankAccount: "481415",
                        type: "Solicitado"
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
    convertWithdrawalsFormat(withdrawReport) {
        //Pega todos os anos-meses no formato: 'YYYY-MM' para depois agrupar os que sao do mesmo mes
        //Get all years-months in format 'YYYY-MM' because after we will agroup the same year/month
        var yearsMonths = [];
        var newArray = [];
        for(let i=0; i < withdrawReport.length; i++) {
            //get the year and the month
            var currentYearMonth = moment(withdrawReport[i].date, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM");
            var arrayPosition = yearsMonths.indexOf(currentYearMonth);

            var dataFormatted = {
                bank: withdrawReport[i].bank,
                formattedValue: withdrawReport[i].formattedValue,
                date: moment(withdrawReport[i].date, "YYYY-MM-DD HH:mm:ss").format("ddd, D MMM"),
                bankAccount: withdrawReport[i].bankAccount,
                type: withdrawReport[i].type,
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
		this.setState({
            withdrawals: newArray
        });
    }

    checkWithdrawStatus(type) {
        var text = "";
        if(type == "requested") {
            text = this.strings.requested;
        } else if (type == "awaiting_return") {
            text = this.strings.awaiting_return;
        } else if (type == "concluded") {
            text = this.strings.concluded;
        } else if (type == "error") {
            text = this.strings.error;
        }
        return text;
    }

    render() {       
        return (

            <View style={{flex: 1}}>
                {/* Flex vertical of 1/10 */}
                <View style={{flex: 1, backgroundColor: "white"}}>
                    <TouchableOpacity 
                        onPress={() =>  this.props.onCloseReport()} 
                    >
                        <Text style={{fontSize: 20, padding: 20, fontWeight: "bold"}}>X</Text>
                    </TouchableOpacity>
                </View>

                {this.state.withdrawals && this.state.withdrawals.length > 0 ? (
                    <View style={{flex: 8}}>{/* Flex vertical of 8/10 */}
                        <FlatList
                            data={this.state.withdrawals}
                            keyExtractor={(x, i) => i.toString()}
                            renderItem={({ item, index }) => (
                                
                                <View>
                                    {item && item.title && item.withdrawals.length > 0 ? (
                                        <View>
                                            <Text style={{padding: 15, fontWeight: "bold", fontSize: 23}}>{item.title}</Text>
                                            
                                            <FlatList
                                                data={item.withdrawals}
                                                keyExtractor={(x, i) => i.toString()}
                                                renderItem={({ item, index }) => (

                                                    <View style={{padding: 5, flexDirection: "row"}}>

                                                        {/* Flex horizontal of 1/8 */}
                                                        <View style={{ flex: 1, backgroundColor:"white", justifyContent: 'center', alignItems: 'center' }}>
                                                            <Image style={{flex: 1, width: 30, height: 30, resizeMode: 'contain'}} source={require('./img/bank-profile.png')} />
                                                        </View>
                                                        
                                                        {/* Flex horizontal of 7/8 */}
                                                        <View style={{flex: 7}}>
                                                            {/* Flex horizontal */}
                                                            <View style={{flexDirection: "row"}}>
                                                                {/* Flex horizontal of 5/7 */}
                                                                <View style={{ flex: 5, backgroundColor:"white"}}>
                                                                    <Text style={{fontWeight: "bold", color: "black", fontSize: 15}}>{this.strings.transaction}</Text>
                                                                    <Text style={{color: "#C4C4C4"}}>{item.date}</Text>
                                                                    <Text style={{color: "#C4C4C4"}}>{this.strings.bank}: {item.bank} - {item.bankAccount}</Text>
                                                                    <Text style={{color: "#C4C4C4"}}>{this.strings.status}: {this.checkWithdrawStatus(item.type)}</Text>
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
                    <View style={{flex: 8}}>{/* Flex vertical of 8/10 */}
                        <View style={{flex: 1, alignItems: "center", paddingTop: 100}}>
                            <Image
                                source={require('./img/icon_balnk_state.png')}
                                style={{ width: 150, height: 150 }}
                            />
                            <Text style={{color: "#cccccc"}}>
                                {this.strings.withdrawals_not_found}
                            </Text>
                        </View>
                    </View>
                )}


                {/* Flex vertical of 1/10 */}
                <TouchableOpacity 
                    style={{
                        flex: 1, 
                        backgroundColor: this.props.buttonColor,  
                        justifyContent: 'center', 
                        alignItems: 'center'
                    }}
                    onPress={() =>  this.props.onGoToAddScreen()} 
                >

                    <Text style={{
                            fontSize: 20, 
                            padding: 20, 
                            color: this.props.textColor, 
                            fontWeight: 
                            "bold"
                        }}>{this.strings.add_withdraw}</Text>
                </TouchableOpacity>
            </View>
                  
        )
    }
}

const styles = StyleSheet.create({
    hr: {
        paddingVertical: 5, 
        borderBottomWidth: 0.5,
        borderBottomColor: '#C4C4C4'
    },

});

export default ReportWithdraw;