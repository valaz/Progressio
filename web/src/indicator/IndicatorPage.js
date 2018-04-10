import React, {Component} from 'react';
import './Indicator.css';
import {addRecord, deleteIndicator, getIndicator, removeRecord} from "../util/APIUtils";
import {notification} from "antd/lib/index";
import {withRouter} from "react-router-dom";
import AddRecordForm from "./AddRecordForm";
import LoadingIndicator from "../common/LoadingIndicator";
import NotFound from "../common/NotFound";
import ServerError from "../common/ServerError";
import {injectIntl} from "react-intl";
import moment from "moment/moment";
import CustomPaginationActionsTable from "./CustomPaginationActionsTable";
import {Grid, withStyles} from "material-ui";
import IndicatorChart from "./IndicatorChart";
import IndicatorCard from "./IndicatorCard";

const dateFormat = 'YYYY-MM-DD';

const gridSize = {
    xs: 12,
    sm: 10,
    md: 8,
    lg: 8
};

const styles = theme => ({
    root: {
        flexGrow: 1,
        marginTop: theme.spacing.unit * 3,
        marginBottom: theme.spacing.unit * 3,
        paddingRight: 16,
        paddingLeft: 16,
    },
    header: theme.mixins.gutters({
        paddingTop: 16,
        paddingBottom: 16,
    }),
});

class IndicatorPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            indicator: {
                name: ''
            },
            records: [],
            tableRecords: [],
            page: 0,
            size: 10,
            totalElements: 0,
            totalPages: 0,
            last: true,
            isLoading: false,
            editDate: null,
            editValue: ''
        };
        this.loadIndicator = this.loadIndicator.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleRecordDelete = this.handleRecordDelete.bind(this);
        this.handleIndicatorDelete = this.handleIndicatorDelete.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
    }

    componentWillMount() {
        this.setState({
            isLoading: true,
            editDate: this.props.editDate,
            editValue: this.props.editValue
        });
    }

    componentDidMount() {
        const id = this.props.match.params.id;
        this.loadIndicator(id);
        document.title = "View Indicator";
    }

    loadIndicator(id) {
        let promise;
        if (this.props.isAuthenticated) {
            promise = getIndicator(id);
        }

        if (!promise) {
            return;
        }

        this.setState({
            isLoading: true
        });
        promise
            .then(response => {
                this.setState({
                    indicator: response,
                    records: response.records,
                    tableRecords: this.getTableRecords(response.records),
                    isLoading: false
                });
                document.title = this.state.indicator.name;
            }).catch(error => {
            if (error.status === 404 || error.status === 403) {
                this.setState({
                    notFound: true,
                    isLoading: false
                });
            } else {
                this.setState({
                    serverError: true,
                    isLoading: false
                });
            }
            console.log(error);
        });
    }

    handleSubmit(date, value) {
        const recordRequest = {
            indicatorId: this.state.indicator.id,
            value: value,
            date: date
        };
        addRecord(recordRequest)
            .then(response => {
                this.setState({
                    indicator: response,
                    records: response.records,
                    tableRecords: this.getTableRecords(response.records),
                    editDate: null,
                    editValue: ''
                });
            }).catch(error => {
            console.log(error);
            notification.error({
                message: 'Progressio',
                description: error.message || 'Sorry! Something went wrong. Please try again!'
            });
            this.setState({
                editDate: null,
                editValue: ''
            });
        });

    }

    getTableRecords(records) {
        let tableRecords = records.map(r => ({...r}));
        tableRecords.reverse();
        tableRecords.map(d => d['tableDate'] = moment(d['date'], dateFormat).format('DD MMMM'));
        return tableRecords;
    }

    handleIndicatorDelete(id) {
        let promise;
        if (this.props.isAuthenticated) {
            promise = deleteIndicator(id);
        }

        if (!promise) {
            return;
        }

        this.setState({
            isLoading: true
        });
        promise
            .then(response => {
            }).catch(error => {
            console.log(error);
        });
        this.setState({
            isLoading: false
        });
    }

    handleRecordDelete(record) {
        const recordRequest = {
            indicatorId: this.state.indicator.id,
            value: record.value,
            date: record.date
        };
        removeRecord(recordRequest)
            .then(response => {
                this.setState({
                    indicator: response,
                    records: response.records,
                    tableRecords: this.getTableRecords(response.records),
                });
            }).catch(error => {
            console.log(error);
            notification.error({
                message: 'Progressio',
                description: error.message || 'Sorry! Something went wrong. Please try again!'
            });
        });
    }

    handleEdit(record) {
        this.setState({
            editDate: record.date,
            editValue: record.value,
        })
    }

    render() {

        if (this.state.isLoading) {
            return <LoadingIndicator/>;
        }

        if (this.state.notFound) {
            return <NotFound/>;
        }

        if (this.state.serverError) {
            return <ServerError/>;
        }

        const {classes} = this.props;

        return (
            <Grid container
                  justify="center"
                  direction='column'
                  className={classes.root}>
                <Grid container item spacing={0} justify="center">
                    <Grid item {...gridSize}>
                        <IndicatorCard indicator={this.state.indicator} handleDelete={this.handleIndicatorDelete}/>
                    </Grid>
                </Grid>
                <Grid container item spacing={0} justify="center">
                    <Grid item {...gridSize}>
                        <AddRecordForm handleSubmit={this.handleSubmit} editDate={this.state.editDate}
                                       editValue={this.state.editValue} data={this.state.records}/>
                    </Grid>
                </Grid>
                <Grid container item spacing={0} justify="center">
                    <Grid item {...gridSize}>
                        <IndicatorChart showAllData={true} data={this.state.records}
                                        name={this.state.indicator.name}
                                        onClickHandler={this.handleEdit}/>
                    </Grid>
                </Grid>
                <Grid container item spacing={0} justify="center">
                    <Grid item {...gridSize}>
                        <CustomPaginationActionsTable dataSource={this.state.tableRecords} editHadler={this.handleEdit}
                                                      deleteHandler={this.handleRecordDelete}/>
                    </Grid>
                </Grid>
            </Grid>
        )
    }

    hasErrors(fieldsError) {
        return Object.keys(fieldsError).some(field => fieldsError[field]);
    }

}

export default injectIntl(withRouter(withStyles(styles)(IndicatorPage)));