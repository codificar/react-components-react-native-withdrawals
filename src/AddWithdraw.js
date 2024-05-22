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
    TextInput,
    BackHandler,
    Dimensions,
    Alert,
    Platform,
    ScrollView,
    KeyboardAvoidingView,
    StatusBar
} from "react-native";
import Colors from '../../../App/Themes/Colors';
import {Picker} from '@react-native-picker/picker';
import { Header } from '@react-navigation/stack';


//Moment date
import moment from "moment";


class AddWithdraw extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentBalance: 0,
            withdrawSettings: {
                with_draw_enabled: null,
                with_draw_max_limit: null,
                with_draw_min_limit: null,
                with_draw_tax: null
            },
            totalToAddWithdraw: "",
            bankSelected: 0,
            providerBanks: [],
            disableDoubleClick: false
        }


        //Get the lang from props. If hasn't lang in props, default is pt-BR
        this.strings = require('./langs/pt-BR.json');
        if(this.props.lang) {
            if(this.props.lang == "pt-BR") {
                this.strings = require('./langs/pt-BR.json');
            }else if(this.props.lang.includes('es')) {
                this.strings = require('./langs/es-PY.json');
            }else if(this.props.lang.indexOf("en") != -1) {
                this.strings = require('./langs/en.json');
            }
        }
    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            this.props.onCloseAdd();
            return true;
        });


     //Get the settings
     this.getWithdrawalsSettings();
    }

    componentWillUnmount() {
		this.backHandler.remove();
    }


    getWithdrawalsSettings() {
        fetch(this.props.urlSettings,{
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                provider_id: this.props.providerId,
                id: this.props.providerId,
                token: this.props.providerToken
            })
        })
        .then((response) => response.json())
        .then((json) => {
            this.setState({
                currentBalance: json.current_balance,
                withdrawSettings: json.withdraw_settings,
                providerBanks: json.provider_banks
            });

        })
        .catch((error) => {
            console.error(error);
        });
    }

    alertAddWithdraw() {
        this.setState({disableDoubleClick: true})
        //Check if bank is selected
        if(!this.state.bankSelected) {
            this.props.onWithdrawAdded(false, this.strings.select_bank, false);
            this.setState({disableDoubleClick: false})
        }
        //Check if user select the value to add withdraw
        else if(!this.state.totalToAddWithdraw) {
            this.props.onWithdrawAdded(false, this.strings.select_value, false);
            this.setState({disableDoubleClick: false})
        }
        //format the value
        else {
            //Valor a adicionar formatado (convertido em float). Remove as virgulas e substitui por ponto.
            var valueToAdd = parseFloat(this.state.totalToAddWithdraw.toString().replace(',', '.')).toFixed(2);
            if(!valueToAdd || valueToAdd == "NaN") {
                this.props.onWithdrawAdded(false, this.strings.valid_value, false);
            } else {
                Alert.alert(
                    this.strings.do_withdraw,
                    this.strings.confirm_withdraw + valueToAdd + "?",
                    [
                        { text: this.strings.cancel, onPress: () => this.setState({disableDoubleClick: false}), style: "cancel" },
                        { text: this.strings.add, onPress: () => this.confirmAddWithdraw(valueToAdd) }
                    ],
                    { cancelable: false }
                );
            }
        }
    }


    confirmAddWithdraw(valueToAdd) {

        var data =  {
            provider_id: this.props.providerId,
            id: this.props.providerId,
            token: this.props.providerToken,
            withdraw_value: valueToAdd,
            bank_account_id: this.state.bankSelected
        };

        if(this.props.type && this.props.type == "user") {
          data =  {
            user_id: this.props.providerId,
            id: this.props.providerId,
            token: this.props.providerToken,
            withdraw_value: valueToAdd,
            bank_account_id: this.state.bankSelected
          };
        }

        fetch(this.props.urlAdd,{
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then((response) => response.json())
        .then((json) => {
            if(json.success) {
                //atualiza os relatorio de saques
                this.props.onWithdrawAdded(true, this.strings.add_withdraw_success, true);
            } else {
                this.props.onWithdrawAdded(false, this.strings.error_add_withdraw, false);
            }

        })
        .catch((error) => {
            console.error(error);
            this.props.onWithdrawAdded(false, this.strings.error_add_withdraw, false);
        }).finally(() => {
          this.setState({disableDoubleClick: false})
        });
    }

    render() {
        return (
            <View style={Platform.OS === 'ios' ? {flex: 1, paddingTop: 45,} : {flex: 1}}>

                <ScrollView style={styles.parentContainer} keyboardShouldPersistTaps="handled">
					<KeyboardAvoidingView
						//style={styles.container}
						behavior={Platform.OS === 'ios' ? 'position' : 'height'}
                        style={{ flex: 1 }}
                        keyboardVerticalOffset={100}
    
						enabled
					>
                        <View style={{flex: 1, flexDirection: "row"}}>
                            <TouchableOpacity
                                onPress={() =>  this.props.onCloseAdd()}
                            >
                                <Text style={{fontSize: 20, paddingLeft: 20, paddingTop: 20, fontWeight: "bold"}}>
                                    X
                                </Text>
                            </TouchableOpacity>
                            <View style={{
                                position: 'absolute',
                                width: Dimensions.get('window').width,
                                justifyContent: 'center',
                                alignItems: 'center'}}
                            >
                                <Text style={{ top: 20, fontWeight: "bold", fontSize: 20 }}>
                                    {this.strings.transfer}
                                </Text>
                            </View>
                        </View>


                        <View style={{flex: 8}}>{/* Flex vertical of 8/10 */}

                            {this.state.currentBalance && this.state.providerBanks.length > 0 ?
                                <View style={{flex: 1, paddingHorizontal: 20}}>
                                    <View style={{ justifyContent: 'center', alignItems: 'center'}}>
                                        <Text style={styles.currentValueText}>{this.strings.your_balance}</Text>
                                        <Text style={styles.currentValue}>{this.state.currentBalance}</Text>
                                    </View>
                                    <View style={{marginTop: 20}}>
                                        <Text style={styles.formText}>{this.strings.bank_account}</Text>
                                        <View style={Platform.OS === 'android' ? styles.form : {}}>
                                            <Picker
                                                selectedValue={this.state.bankSelected}
                                                onValueChange={(itemValue, itemIndex) =>
                                                    this.setState({bankSelected: itemValue})
                                                }>
                                                <Picker.Item key={0} itemStyle={{fontSize: 8}} value={0} label={this.strings.select} />
                                                {this.state.providerBanks && this.state.providerBanks.length > 0 ? this.state.providerBanks.map((bank, i) => {
                                                    return <Picker.Item key={i} value={bank.id} label={bank.bank + " - " + bank.account} />
                                                }): null}
                                            </Picker>
                                        </View>
                                    </View>

                                    <View style={{marginTop: 20}}>
                                        <Text style={styles.formValueTransfer}>{this.strings.transfer_value}</Text>
                                        <View style={styles.form}>
                                            <TextInput
                                                style={{fontSize: 16, paddingLeft: 10}}
                                                keyboardType='numeric'
                                                placeholder={this.strings.write_value}
                                                onChangeText={text => this.setState({ totalToAddWithdraw: text })}
                                                value={this.state.totalToAddWithdraw ? String(this.state.totalToAddWithdraw) : null}
                                            />
                                        </View>
                                    </View>

                                    <View style={{marginTop: 20}}>

                                        <View style={{flexDirection: "row"}}>
                                            <View>
                                                <Text style={styles.infoText}>
                                                    {this.strings.min_value ?? ''}
                                                </Text>
                                            </View>
                                            <View style={{flex: 1 }}>
                                                <View style={styles.hr}></View>
                                            </View>
                                            <View>
                                                <Text style={styles.infoText}>
                                                    {this.state.withdrawSettings.with_draw_min_limit ?? ''}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={{flexDirection: "row"}}>
                                            <View>
                                                <Text style={styles.infoText}>
                                                    {this.strings.max_value ?? ''}
                                                </Text>
                                            </View>
                                            <View style={{flex: 1 }}>
                                                <View style={styles.hr}></View>
                                            </View>
                                            <View>
                                                <Text style={styles.infoText}>
                                                    {this.state.withdrawSettings.with_draw_max_limit ?? ''}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={{flexDirection: "row"}}>
                                            <View>
                                                <Text style={styles.infoText}>
                                                    {this.strings.withdraw_tax ?? ''}
                                                </Text>
                                            </View>
                                            <View style={{flex: 1 }}>
                                                <View style={styles.hr}></View>
                                            </View>
                                            <View>
                                                <Text style={styles.infoText}>
                                                    {this.state.withdrawSettings.with_draw_tax ?? '-'}
                                                </Text>
                                            </View>
                                        </View>

                                    </View>
                                </View>
                            : null }

                        </View>
                        <View style={{ flex: 1, justifyContent: 'center' }}>{/* Flex vertical of 1/10 */}
                            <TouchableOpacity
                                style={{ borderRadius: 3, padding: 10, elevation: 2,marginHorizontal: 30, backgroundColor: this.props.buttonColor }}
                                disabled={this.state.disableDoubleClick}
                                onPress={() => {
                                    this.alertAddWithdraw();
                                }}
                            >
                                <Text style={{color: this.props.textColor, fontSize: 16, fontWeight: "bold", textAlign: "center" }}>{this.strings.add}</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({

    infoView: {
        flex: 1,
        alignItems: "flex-start",
        marginTop: 22
      },
    parentContainer: {
        flex: 1,
        backgroundColor: "#ffffff",
        //padding: 0
    },

    container:{

      flex: 1,
      backgroundColor: Colors.transparent
    },

      text: {
        marginBottom: 15,
        fontSize: 15,
        paddingLeft: 10
      },
      textTitle: {
        marginBottom: 15,
        fontSize: 17,
        paddingLeft: 10,
        fontWeight: "bold"
      },
      formText: {
        fontSize: 14,
        color: "#bfbfbf",
        marginLeft: 5
      },
      currentValueText: {
        fontSize: 17,
        color: "#bfbfbf",
        marginLeft: 5
      },
      currentValue: {
        fontSize: 30,
        color: "black",
        marginLeft: 5,
        fontWeight: "bold"
      },
      formValueTransfer: {
        fontSize: 17,
        color: "black",
        marginLeft: 5,
        fontWeight: "bold"
      },
      form: {
        height: 40,
        fontSize: 16,
        marginHorizontal: 7,
        marginBottom: 15,
        borderBottomWidth: 0.2
      },
      hr: {
        paddingVertical: 5,
        borderBottomWidth: 0.7,
        borderBottomColor: '#C4C4C4'
    },
    infoText: {
        marginBottom: 15,
        fontSize: 15,
        paddingHorizontal: 10
    }

});

export default AddWithdraw;
