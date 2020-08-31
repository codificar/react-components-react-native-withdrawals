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
    BackHandler
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
            totalToAddWithdraw: ""
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
            console.log("json: ", json);
            this.setState({
                currentBalance: json.current_balance,
                withdrawSettings: json.withdraw_settings
            });
            
        })
        .catch((error) => {
            console.error(error);
        });
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
                    //atualiza os relatorio de saques
                    this.props.onWithdrawAdded(true);
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

                
                <View style={{flex: 9}}>{/* Flex vertical of 8/10 */}
                    <Text style={{padding: 15, fontWeight: "bold", fontSize: 23 }}>{this.strings.add_withdraw}</Text>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>

                            {this.state.currentBalance && this.state.withdrawSettings ? 
                                <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
                                    <Text style={styles.modalText}>{this.strings.min_value}: {this.state.withdrawSettings.with_draw_min_limit}</Text>
                                    <Text style={styles.modalText}>{this.strings.max_value}: {this.state.withdrawSettings.with_draw_max_limit}</Text>
                                    <Text style={styles.modalText}>{this.strings.withdraw_tax}: {this.state.withdrawSettings.with_draw_tax}</Text>
                                    <Text style={styles.modalText}>{this.strings.your_balance}: {this.state.currentBalance}</Text>


                                    <TextInput
                                        style={{height: 40,
                                            marginBottom: 15,
                                            borderBottomWidth: 1}}
                                        keyboardType='numeric'
                                        placeholder={this.strings.write_value}
                                        onChangeText={text => this.setState({ totalToAddWithdraw: text })}
                                        value={this.state.totalToAddWithdraw ? String(this.state.totalToAddWithdraw) : null}
                                    />


                                    <TouchableOpacity
                                        style={{ ...styles.openButton, backgroundColor: this.props.buttonColor }}
                                        onPress={() => {
                                            this.confirmAddWithdraw();
                                        }}
                                    >
                                        <Text style={{color: this.props.textColor, fontWeight: "bold", textAlign: "center" }}>{this.strings.add}</Text>
                                    </TouchableOpacity>
                                
                                </View>
                            : null }
                            
                        </View>
                    </View>


                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({

    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
      },
      modalView: {
        flex: 1,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignSelf: 'stretch',
        marginHorizontal: 20,
        marginBottom: 20,
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
      modalText: {
        marginBottom: 15,
        fontSize: 20,
        textAlign: "center"
      }

});

export default AddWithdraw;