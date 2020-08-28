import React, { Component } from 'react';
import { 
    View, 
    TouchableOpacity, 
    Text, 
    FlatList, 
    StyleSheet, 
    Image,
    Button,
    Modal,
    TextInput
} from "react-native";

//Moment date
import moment from "moment";

class WithdrawalsReport extends Component {

    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
            content: "",
            withdrawals: [],
            modalVisible: false,
            currentBalance: 0,
            withdrawSettings: {
                with_draw_enabled: null,
                with_draw_max_limit: null,
                with_draw_min_limit: null,
                with_draw_tax: null
            },
            totalToAddWithdraw: ""
        }
    }

    componentDidMount() {
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

            this.convertWithdrawalsFormat(json.withdrawals_report, json.withdraw_settings, json.current_balance);
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

    checkWithdrawStatus(type) {
        var text = "";
        if(type == "requested") {
            text = "Solicitado";
        } else if (type == "awaiting_return") {
            text = "Em processamento"
        } else if (type == "concluded") {
            text = "Concluído"
        } else if (type == "error") {
            text = "Erro"
        }
        return text;
    }
    confirmAddWithdraw() {
        if(this.state.totalToAddWithdraw) {
            fetch(this.props.urlAdd,{
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    provider_id: this.props.providerId,
                    token: this.props.providerToken,
                    withdraw_value: this.state.totalToAddWithdraw
                })
            })
            .then((response) => response.json())
            .then((json) => {
                if(json.success) {
                    this.props.onWithdrawAdded(true);

                    //atualiza os relatorio de saques
                    this.getWithdrawalsReport();
                } else {
                    this.props.onWithdrawAdded(false);
                }

            })
            .catch((error) => {
                console.error(error);
                this.props.onWithdrawAdded(false);
            });
        } else {
            this.props.onWithdrawAdded(false);
        }
    }
    convertWithdrawalsFormat(withdrawReport, withdrawSettings, currentBalance) {
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
            withdrawals: newArray,
            currentBalance: currentBalance,
            withdrawSettings: withdrawSettings
        });
    }
    setModalVisible = (visible) => {
        this.setState({ modalVisible: visible });
    }

    render() {       
        const { modalVisible } = this.state;
        return (
            <View style={styles.body}>

                {/* Flex vertical of 1/10 */}
                <View style={{flex: 1, backgroundColor: "white"}}>
                    <TouchableOpacity 
                        onPress={() =>  this.props.onClose()} 
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
                                                                    <Text style={{fontWeight: "bold", color: "black", fontSize: 15}}>Transação</Text>
                                                                    <Text style={{color: "#C4C4C4"}}>{item.date}</Text>
                                                                    <Text style={{color: "#C4C4C4"}}>Banco: {item.bank} - {item.bankAccount}</Text>
                                                                    <Text style={{color: "#C4C4C4"}}>Status: {this.checkWithdrawStatus(item.type)}</Text>
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
                                Nenhum saque encontrado
                            </Text>
                        </View>
                    </View>
                 )}


                {/* Flex vertical of 1/10 */}
                <TouchableOpacity 
                    style={{flex: 1, backgroundColor: "#647a63",  justifyContent: 'center', alignItems: 'center'}}
                    onPress={() => this.setModalVisible(true)} 
                >

                    <Text style={{fontSize: 20, padding: 20, color: "white", fontWeight: "bold"}}>Solicitar saque</Text>
                </TouchableOpacity>


                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                    }}
                    >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modaltitle}>Realizar saque</Text>
                            <Text style={styles.modalText}>Valor mínimo: {this.state.withdrawSettings.with_draw_min_limit}</Text>
                            <Text style={styles.modalText}>Valor máximo: {this.state.withdrawSettings.with_draw_max_limit}</Text>
                            <Text style={styles.modalText}>Taxa de Saque: {this.state.withdrawSettings.with_draw_tax}</Text>
                            <Text style={styles.modalText}>Seu saldo: {this.state.currentBalance}</Text>

                            <TextInput
								style={{height: 40,
									marginBottom: 15,
									borderBottomWidth: 1}}
                                keyboardType='numeric'
                                placeholder="DIGITE O VALOR"
                                onChangeText={text => this.setState({ totalToAddWithdraw: text })}
                                value={this.state.totalToAddWithdraw ? String(this.state.totalToAddWithdraw) : null}
							/>


                            <View style={{flexDirection: "row"}}>
                                <TouchableOpacity
                                    style={{ ...styles.openButton, backgroundColor: "grey" }}
                                    onPress={() => {
                                        this.setModalVisible(!modalVisible);
                                    }}
                                >
                                    <Text style={styles.textStyle}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                                    onPress={() => {
                                        this.setModalVisible(!modalVisible);
                                        this.confirmAddWithdraw();
                                    }}
                                >
                                    <Text style={styles.textStyle}>Sacar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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
    },



    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
      },
      modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
      },
      openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginHorizontal: 5
      },
      textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
      },
      modaltitle: {
        marginBottom: 15,
        fontSize: 20,
        textAlign: "center",
        fontWeight: 'bold'
      },
      modalText: {
        marginBottom: 10,
        textAlign: "center"
      }
});

export default WithdrawalsReport;