import React, { Component } from 'react';
import { 
    View, 
    StyleSheet

} from "react-native";

//Transactions component
import AddWithdraw from "./AddWithdraw";
import ReportWithdraw from './ReportWithdraw';

class WithdrawalsReport extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isInAddScreen: false
        }
    }

    componentDidMount() {
        
    }

    /**
     * When click to close report, send event for project that use this component
     */
    onCloseReport() {
        this.props.onClose();
    }

    /**
     * When click to close add in AddWithdraw screen, go to ReportScreen
     */
    onCloseAdd() {
        this.setState({ isInAddScreen: false });
    }
    
    /**
     * When withdraw was added, send event for project. The project can do a alert message.
     */
	onWithdrawAdded(status, msg, closeAddWithdrawScreen = true) {
        this.props.onWithdrawAdded(status, msg);
        if(closeAddWithdrawScreen) {
            this.setState({ isInAddScreen: false });
        }
    }

    /**
     * Evento to go in AddWithdraw screen
     */
    onGoToAddScreen() {
        this.setState({ isInAddScreen: true });
    }

    render() {       
        return (
            <View style={styles.body}>
                {this.state.isInAddScreen ? (
                    <AddWithdraw
                        providerId={this.props.providerId}
                        providerToken={this.props.providerToken}
                        lang={this.props.lang}
                        onWithdrawAdded={this.onWithdrawAdded.bind(this)}
                        onCloseAdd={this.onCloseAdd.bind(this)}
                        urlAdd={this.props.urlAdd}
                        urlSettings={this.props.urlSettings}
                        buttonColor={this.props.buttonColor ? this.props.buttonColor : "#647a63"}
                        textColor={this.props.textColor ? this.props.textColor : "white"}
                    />
                ) : (
                    <ReportWithdraw
                        providerId={this.props.providerId}
                        providerToken={this.props.providerToken}
                        lang={this.props.lang}
                        urlReport={this.props.urlReport}
                        onCloseReport={this.onCloseReport.bind(this)}
                        onGoToAddScreen={this.onGoToAddScreen.bind(this)}
                        buttonColor={this.props.buttonColor ? this.props.buttonColor : "#647a63"}
                        textColor={this.props.textColor ? this.props.textColor : "white"}
                    />
                )}
                  
            </View>
        )
    }
}

const styles = StyleSheet.create({
    body: {
        flex: 1, 
        backgroundColor: 'white'
    }
});

export default WithdrawalsReport;