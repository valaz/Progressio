import React, {Component} from 'react';
import {FormattedMessage, injectIntl} from "react-intl";
import {Button, Grid, IconButton, InputAdornment, TextField, withStyles} from "material-ui";
import {DatePicker} from "material-ui-pickers";
import moment from "moment";
import PropTypes from "prop-types";
import NumberFormat from 'react-number-format';
import classNames from 'classnames';

const dateFormat = 'YYYY-MM-DD';
const datePickerFormat = "LL";

const styles = theme => ({
    root: {
        flexGrow: 1,
        marginTop: theme.spacing.unit
    },
    textField: {},
    picker: {
        day: {
            color: '#fff',
        },
        selected: {
            backgroundColor: '#fff',
        },
        current: {
            color: '#fff',
        },
    },
    button: {
        marginTop: '10px'
    },
    dayWrapper: {
        position: 'relative',
    },
    day: {
        width: 36,
        height: 36,
        fontSize: theme.typography.caption.fontSize,
        margin: '0 2px',
        color: 'inherit',
    },
    customDayHighlight: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '2px',
        right: '2px',
        border: `1px solid ${theme.palette.secondary.main}`,
        borderRadius: '50%',
    },
    nonCurrentMonthDay: {
        color: theme.palette.text.disabled,
    },
    highlightNonCurrentMonthDay: {
        color: '#676767',
    },
    highlight: {
        background: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
    firstHighlight: {
        extend: 'highlight',
        borderTopLeftRadius: '50%',
        borderBottomLeftRadius: '50%',
    },
    endHighlight: {
        extend: 'highlight',
        borderTopRightRadius: '50%',
        borderBottomRightRadius: '50%',
    },
});

function NumberFormatCustom(props) {
    const {inputRef, onChange, ...other} = props;
    return (
        <NumberFormat
            {...other}
            ref={inputRef}
            onValueChange={values => {
                onChange({
                    target: {
                        value: values.value,
                    },
                });
            }}
            decimalScale={3}
            thousandSeparator
        />
    );
}

NumberFormatCustom.propTypes = {
    inputRef: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
};

class AddRecordForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            date: {
                value: null
            },
            value: {
                value: ''
            },
            notification: {
                open: false,
                message: ''
            },
            editDate: null,
            editValue: null,
            selectedDate: null,
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.renderWrappedWeekDay = this.renderWrappedWeekDay.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        let valueValue = nextProps.editValue;
        if (valueValue) {
            this.setState({
                value: {
                    value: valueValue,
                    ...this.validateValue(valueValue)
                }
            });
        } else {
            this.setState({
                value: {
                    value: ''
                }
            });

        }
        let dateValue = moment(nextProps.editDate, dateFormat);
        if (dateValue.isValid()) {
            this.setState({
                date: {
                    value: dateValue,
                    ...this.validateDate(dateValue)
                }
            });
        } else {
            this.setState({
                date: {
                    value: null
                }
            });

        }
    }

    handleChange = name => event => {
        this.setState({
            [name]: {
                value: event.target.value
            },
        });
    };

    editDateValue(date, value) {
        const {resetFields} = this.props.form;
        const {setFields} = this.props.form;
        resetFields();
        setFields({
            valueInput: {
                value: value
            }

        });
    }

    handleSubmit(event) {
        event.preventDefault();
        let date = this.state.date.value.format(dateFormat);
        let value = this.state.value.value;
        this.resetFields();
        this.props.handleSubmit(date, value);
    }

    resetFields() {
        this.setState({
            date: {
                value: null,
                validateStatus: null,
                errorMsg: null,
                hasError: false

            },
            value: {
                value: '',
                validateStatus: null,
                errorMsg: null,
                hasError: false

            },
        })
    }

    isFormInvalid() {
        return !(this.state.date.validateStatus === 'success' &&
            this.state.value.validateStatus === 'success'
        );
    }

    handleDateChange(value, validationFun) {
        this.setState({
            date: {
                value: value,
                ...validationFun(value)
            },
            editDate: value.format(dateFormat)
        });
    }

    handleNumberChange(name, event, validationFun) {
        const target = event.target;
        const inputName = name;
        const inputValue = target.value;

        this.setState({
            [inputName]: {
                value: inputValue,
                ...validationFun(inputValue)
            }
        });
    }

    handleInputChange(event, validationFun) {
        const target = event.target;
        const inputName = target.name;
        const inputValue = target.value;

        this.setState({
            [inputName]: {
                value: inputValue,
                ...validationFun(inputValue)
            }
        });
    }

    renderWrappedWeekDay(date, selectedDate, dayInCurrentMonth) {
        const {classes, data} = this.props;

        let hasRecord = false;
        let hasPreviuosRecord = false;
        let hasNextRecord = false;
        let prevDate = moment(date).subtract(1, 'days');
        let nextDate = moment(date).add(1, 'days');
        if (data.some(e => e.date === date.format(dateFormat))) {
            hasRecord = true
        }
        if (data.some(e => e.date === prevDate.format(dateFormat))) {
            hasPreviuosRecord = true
        }
        if (data.some(e => e.date === nextDate.format(dateFormat))) {
            hasNextRecord = true
        }
        const wrapperClassName = classNames({
            [classes.highlight]: hasRecord,
            [classes.firstHighlight]: date.day() === 1 || !hasPreviuosRecord,
            [classes.endHighlight]: date.day() === 0 || !hasNextRecord,
        });

        const dayClassName = classNames(classes.day, {
            [classes.nonCurrentMonthDay]: !dayInCurrentMonth,
            [classes.highlightNonCurrentMonthDay]: !dayInCurrentMonth && true,
        });

        return (
            <div className={wrapperClassName}>
                <IconButton className={dayClassName}>
                    <span> {date.format('D')} </span>
                </IconButton>
            </div>
        );
    }

    render() {
        const selectedDate = this.state.date.value;
        const {classes, unit} = this.props;
        return (
            <form onSubmit={this.handleSubmit} style={{textAlign: 'center'}} className={classes.root}>
                <Grid container
                      spacing={16} justify="center">
                    <Grid item xs={12} sm={6} md={4} align="center">
                        <DatePicker fullWidth
                                    autoOk
                                    error={this.state.date.hasError}
                                    helperText={this.state.date.errorMsg}
                                    id="date"
                                    name="date"
                                    label={this.props.intl.formatMessage({id: 'indicator.view.form.date.placeholder'})}
                                    cancelLabel={this.props.intl.formatMessage({id: 'indicator.view.form.date.cancel'})}
                                    okLabel={this.props.intl.formatMessage({id: 'indicator.view.form.date.ok'})}
                                    todayLabel={this.props.intl.formatMessage({id: 'indicator.view.form.date.today'})}
                                    showTodayButton
                                    disableFuture
                                    format={datePickerFormat}
                                    maxDateMessage="Date must be less than today"
                                    value={selectedDate}
                                    onChange={(event) => this.handleDateChange(event, this.validateDate)}
                                    animateYearScrolling={false}
                                    className={classes.picker}
                                    renderDay={this.renderWrappedWeekDay}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} align="center">
                        <TextField fullWidth
                                   autoComplete="off"
                                   error={this.state.value.hasError}
                                   helperText={this.state.value.errorMsg}
                                   id="value"
                                   name="value"
                                   label={this.props.intl.formatMessage({id: 'indicator.view.form.value.placeholder'})}
                                   value={this.state.value.value}
                                   onChange={(event) => this.handleNumberChange("value", event, this.validateValue)}
                                   className={classes.textField}
                                   InputProps={{
                                       inputComponent: NumberFormatCustom,
                                       startAdornment: <InputAdornment position="start">{unit}</InputAdornment>,
                                   }}

                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} align="center">
                        <Button fullWidth type="submit" variant="raised" color="primary" size="large"
                                disabled={this.isFormInvalid()} className={classes.button}>
                            <FormattedMessage id="indicator.view.form.submit"/>
                        </Button>
                    </Grid>
                </Grid>
            </form>
        )
    }

    validateValue = (value) => {
        if (value) {
            if (value > Math.pow(2, 63)) {
                return {
                    validateStatus: 'error',
                    errorMsg: this.props.intl.formatMessage({id: 'indicator.view.form.value.error.long'}),
                    hasError: true
                }
            }
            if (value < -Math.pow(2, 63)) {
                return {
                    validateStatus: 'error',
                    errorMsg: this.props.intl.formatMessage({id: 'indicator.view.form.value.error.long'}),
                    hasError: true
                }
            }
            return {
                validateStatus: 'success',
                errorMsg: '',
                hasError: false
            }
        } else {
            return {
                validateStatus: 'error',
                errorMsg: this.props.intl.formatMessage({id: 'indicator.view.form.value.error.empty'}),
                hasError: true
            }
        }
    };

    validateDate = (date) => {
        if (date !== null) {
            return {
                validateStatus: 'success',
                errorMsg: '',
                hasError: false
            }
        } else {
            return {
                validateStatus: 'error',
                errorMsg: this.props.intl.formatMessage({id: 'indicator.view.form.date.error.empty'}),
                hasError: true
            }
        }
    };
}

export default injectIntl(withStyles(styles)(AddRecordForm));