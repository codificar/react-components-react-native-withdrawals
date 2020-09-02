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
    Picker
} from "react-native";

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
            providerBanks: []
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


    confirmAddWithdraw() {

        //Check if bank is selected
        if(!this.state.bankSelected) {
            this.props.onWithdrawAdded(false, this.strings.select_bank, false); 
        }

        //Check if user select the value to add withdraw
        else if(!this.state.totalToAddWithdraw) {
            this.props.onWithdrawAdded(false, this.strings.select_value, false);
        } 
        //If all is ok, call api
        else {
            fetch(this.props.urlAdd,{
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    provider_id: this.props.providerId,
                    token: this.props.providerToken,
                    withdraw_value: this.state.totalToAddWithdraw,
                    bank_account_id: this.state.bankSelected
                })
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
            });
        }
    }
    
    render() {       
        return (
            <View style={{flex: 1}}>
                {/* Flex vertical of 1/10 */}
                <View style={{flex: 1, backgroundColor: "white"}}>
                    <TouchableOpacity 
                        onPress={() =>  this.props.onCloseAdd()} 
                    >
                        <Text style={{fontSize: 20, padding: 20, fontWeight: "bold"}}>X</Text>
                    </TouchableOpacity>
                </View>

                
                <View style={{flex: 8}}>{/* Flex vertical of 8/10 */}
                    <Text style={{paddingLeft: 15, fontWeight: "bold", fontSize: 23 }}>{this.strings.add_withdraw}</Text>

                    {this.state.currentBalance && this.state.providerBanks.length > 0 ? 
                        <View style={{flex: 1, paddingHorizontal: 30}}>
                            
                            <View style={{marginTop: 20}}>
                                <Text style={styles.formText}>Conta bancária</Text>
                                <Picker
                                    selectedValue={this.state.bankSelected}
                                    onValueChange={(itemValue, itemIndex) =>
                                        this.setState({bankSelected: itemValue})
                                    }>
                                    <Picker.Item value={0} label={this.strings.select} />
                                    {this.state.providerBanks.length && this.state.providerBanks.map((bank, i) => {
                                        return <Picker.Item key={i} value={bank.id} label={bank.bank + " - " + bank.account} />
                                    })}
                                </Picker>
                            </View>

                            <View style={{marginTop: 20}}>
                                <Text style={styles.formText}>Valor</Text>
                                <TextInput
                                    style={{height: 40,
                                        fontSize: 16,
                                        marginHorizontal: 7,
                                        marginBottom: 15,
                                        borderBottomWidth: 0.2}}
                                    keyboardType='numeric'
                                    placeholder={this.strings.write_value}
                                    onChangeText={text => this.setState({ totalToAddWithdraw: text })}
                                    value={this.state.totalToAddWithdraw ? String(this.state.totalToAddWithdraw) : null}
                                />
                            </View>

                            <View style={{marginTop: 20}}>
                                <Text style={styles.text}>{this.strings.min_value}: {this.state.withdrawSettings.with_draw_min_limit}</Text>
                                <Text style={styles.text}>{this.strings.max_value}: {this.state.withdrawSettings.with_draw_max_limit}</Text>
                                <Text style={styles.text}>{this.strings.withdraw_tax}: {this.state.withdrawSettings.with_draw_tax}</Text>
                                <Text style={styles.text}>{this.strings.your_balance}: {this.state.currentBalance}</Text>
                            </View>
                        </View>
                    : null }
                        
                </View>
                <View style={{ flex: 1 }}>{/* Flex vertical of 1/10 */}
                    <TouchableOpacity
                        style={{ borderRadius: 20, padding: 10, elevation: 2,marginHorizontal: 30, backgroundColor: this.props.buttonColor }}
                        onPress={() => {
                            this.confirmAddWithdraw();
                        }}
                    >
                        <Text style={{color: this.props.textColor, fontWeight: "bold", textAlign: "center" }}>{this.strings.add}</Text>
                    </TouchableOpacity>
                </View>
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

      text: {
        marginBottom: 15,
        fontSize: 17
      },
      textTitle: {
        marginBottom: 15,
        fontSize: 17,
        paddingLeft: 10,
        fontWeight: "bold"
      },
      formText: {
        fontSize: 17
      }

});

export default AddWithdraw;