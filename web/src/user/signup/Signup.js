import React, {Component} from 'react';
import {checkEmailAvailability, checkUsernameAvailability, signup} from '../../util/APIUtils';
import {Link} from 'react-router-dom';
import {
    EMAIL_MAX_LENGTH,
    NAME_MAX_LENGTH,
    NAME_MIN_LENGTH,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    USERNAME_MAX_LENGTH,
    USERNAME_MIN_LENGTH
} from '../../constants';

import {FormattedMessage, injectIntl} from "react-intl";
import {Button, Grid, TextField, withStyles} from "material-ui";
import Notification from "../../common/Notification";

const gridSize = {
    xs: 12,
    sm: 8,
    md: 6,
    lg: 4
};

const styles = theme => ({
    header: {
        textAlign: 'center'
    }
});

class Signup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: {
                value: ''
            },
            username: {
                value: ''
            },
            email: {
                value: ''
            },
            password: {
                value: ''
            },
            passwordConfirm: {
                value: ''
            },
            notification: {
                open: false,
                message: ''
            },
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateAll = this.validateAll.bind(this);
        this.validateUsernameAvailability = this.validateUsernameAvailability.bind(this);
        this.validateEmailAvailability = this.validateEmailAvailability.bind(this);
        this.validatePasswords = this.validatePasswords.bind(this);
        this.isFormInvalid = this.isFormInvalid.bind(this);
        this.clearNotification = this.clearNotification.bind(this);
    }

    componentDidMount() {
        document.title = this.props.intl.formatMessage({id: 'signup.header'});
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

    clearNotification() {
        this.setState({
            notification: {
                open: false,
                message: ''
            }
        });
    }

    handleSubmit(event) {
        event.preventDefault();

        const signupRequest = {
            name: this.state.name.value,
            email: this.state.email.value,
            username: this.state.username.value,
            password: this.state.password.value
        };
        signup(signupRequest)
            .then(response => {
                this.props.onSignup();
            }).catch(error => {
            this.setState({
                notification: {
                    open: true,
                    message: this.props.intl.formatMessage({id: 'notification.error'})
                }
            });
        });
    }

    isFormInvalid() {
        let isValid = this.state.name.validateStatus === 'success' &&
            this.state.username.validateStatus === 'success' &&
            this.state.email.validateStatus === 'success' &&
            this.state.password.validateStatus === 'success' &&
            this.state.passwordConfirm.validateStatus === 'success';
        return !isValid;
    }

    validateAll() {
        this.validateUsernameAvailability();
        this.validateEmailAvailability();
        this.validatePasswords()
    }

    render() {
        let nameLabel = this.props.intl.formatMessage({id: 'signup.form.name.label'});
        let usernameLabel = this.props.intl.formatMessage({id: 'signup.form.username.label'});
        let emailLabel = this.props.intl.formatMessage({id: 'signup.form.email.label'});
        let passwordLabel = this.props.intl.formatMessage({id: 'signup.form.password.label'});
        let passwordConfirmLabel = this.props.intl.formatMessage({id: 'signup.form.passwordConfirm.label'});
        const {classes} = this.props;
        return (
            <div style={{padding: 24, background: '#f1f1f1'}}>
                <h1 className={classes.header}>
                    <FormattedMessage id="signup.header"/>
                </h1>
                <Notification open={this.state.notification.open} message={this.state.notification.message}
                              cleanup={this.clearNotification}/>
                <form onSubmit={this.handleSubmit}>
                    <Grid item xs={12}>
                        <Grid container
                              justify="center"
                              direction='column'
                              spacing={16}>
                            <Grid container item spacing={0} justify="center">
                                <Grid item {...gridSize}>
                                    <TextField fullWidth autoFocus
                                               autoComplete="off"
                                               error={this.state.name.hasError}
                                               helperText={this.state.name.errorMsg}
                                               id="name"
                                               name="name"
                                               label={nameLabel}
                                               value={this.state.name.value}
                                               onChange={(event) => this.handleInputChange(event, this.validateName)}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container item spacing={0} justify="center">
                                <Grid item {...gridSize}>
                                    <TextField fullWidth
                                               autoComplete="off"
                                               error={this.state.username.hasError}
                                               helperText={this.state.username.errorMsg}
                                               id="username"
                                               name="username"
                                               label={usernameLabel}
                                               value={this.state.username.value}
                                               onBlur={this.validateUsernameAvailability}
                                               onChange={(event) => this.handleInputChange(event, this.validateUsername)}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container item spacing={0} justify="center">
                                <Grid item {...gridSize}>
                                    <TextField fullWidth
                                               autoComplete="off"
                                               error={this.state.email.hasError}
                                               helperText={this.state.email.errorMsg}
                                               id="email"
                                               name="email"
                                               label={emailLabel}
                                               value={this.state.email.value}
                                               onBlur={this.validateEmailAvailability}
                                               onChange={(event) => this.handleInputChange(event, this.validateEmail)}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container item spacing={0} justify="center">
                                <Grid item {...gridSize}>
                                    <TextField fullWidth
                                               autoComplete="off"
                                               error={this.state.password.hasError}
                                               helperText={this.state.password.errorMsg}
                                               id="password"
                                               name="password"
                                               label={passwordLabel}
                                               type="password"
                                               value={this.state.password.value}
                                               onBlur={this.validatePasswords}
                                               onChange={(event) => this.handleInputChange(event, this.validatePassword)}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container item spacing={0} justify="center">
                                <Grid item {...gridSize}>
                                    <TextField fullWidth
                                               autoComplete="off"
                                               error={this.state.passwordConfirm.hasError}
                                               helperText={this.state.passwordConfirm.errorMsg}
                                               id="passwordConfirm"
                                               name="passwordConfirm"
                                               label={passwordConfirmLabel}
                                               type="password"
                                               value={this.state.passwordConfirm.value}
                                               onBlur={this.validatePasswords}
                                               onChange={(event) => this.handleInputChange(event, this.validatePasswordConfirm)}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container item spacing={0} justify="center">
                                <Grid item {...gridSize}>
                                    <Button fullWidth type="submit" variant="raised" color="primary" size="large"
                                            disabled={this.isFormInvalid()}>
                                        <FormattedMessage id="signup.form.submit"/>
                                    </Button>

                                    <FormattedMessage id="signup.form.login.registered"/> <Link to="/login">
                                    <FormattedMessage id="signup.form.login.now"/>
                                </Link>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </form>
            </div>
        );
    }

    // Validation Functions
    validateName = (name) => {
        if (name.length < NAME_MIN_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: this.props.intl.formatMessage({id: 'signup.form.name.error.short'}, {minLength: NAME_MIN_LENGTH}),
                hasError: true
            }
        } else if (name.length > NAME_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: this.props.intl.formatMessage({id: 'signup.form.name.error.long'}, {maxLength: NAME_MAX_LENGTH}),
                hasError: true
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null,
                hasError: false
            };
        }
    };

    validateUsername = (username) => {
        if (username.length < USERNAME_MIN_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: this.props.intl.formatMessage({id: 'signup.form.username.error.short'}, {minLength: USERNAME_MIN_LENGTH}),
                hasError: true
            }
        } else if (username.length > USERNAME_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: this.props.intl.formatMessage({id: 'signup.form.username.error.long'}, {maxLength: USERNAME_MAX_LENGTH}),
                hasError: true
            }
        } else {
            return {
                validateStatus: null,
                errorMsg: null,
                hasError: false
            }
        }
    };

    validateEmail = (email) => {
        if (!email) {
            return {
                validateStatus: 'error',
                errorMsg: this.props.intl.formatMessage({id: 'signup.form.email.error.empty'}),
                hasError: true
            }
        }

        const EMAIL_REGEX = RegExp('[^@ ]+@[^@ ]+\\.[^@ ]+');
        if (!EMAIL_REGEX.test(email)) {
            return {
                validateStatus: 'error',
                errorMsg: this.props.intl.formatMessage({id: 'signup.form.email.error.invalid'}),
                hasError: true
            }
        }

        if (email.length > EMAIL_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: this.props.intl.formatMessage({id: 'signup.form.email.error.long'}, {maxLength: EMAIL_MAX_LENGTH}),
                hasError: true
            }
        }

        return {
            validateStatus: null,
            errorMsg: null,
            hasError: false
        }
    };

    validatePassword = (password) => {
        if (password.length < PASSWORD_MIN_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: this.props.intl.formatMessage({id: 'signup.form.password.error.short'}, {minLength: PASSWORD_MIN_LENGTH}),
                hasError: true
            }
        } else if (password.length > PASSWORD_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: this.props.intl.formatMessage({id: 'signup.form.password.error.long'}, {maxLength: PASSWORD_MAX_LENGTH}),
                hasError: true
            }
        } else {
            return {
                validateStatus: null,
                errorMsg: null,
                hasError: false
            };
        }
    };

    validatePasswordConfirm = (password) => {
        if (password.length < PASSWORD_MIN_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: this.props.intl.formatMessage({id: 'signup.form.passwordConfirm.error.short'}, {minLength: PASSWORD_MIN_LENGTH}),
                hasError: true
            }
        } else if (password.length > PASSWORD_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: this.props.intl.formatMessage({id: 'signup.form.passwordConfirm.error.long'}, {maxLength: PASSWORD_MAX_LENGTH}),
                hasError: true
            }
        } else {
            return {
                validateStatus: null,
                errorMsg: null,
                hasError: false
            };
        }
    };

    validateUsernameAvailability() {
        // First check for client side errors in username
        const usernameValue = this.state.username.value;
        const usernameValidation = this.validateUsername(usernameValue);

        if (usernameValidation.validateStatus === 'error') {
            this.setState({
                username: {
                    value: usernameValue,
                    ...usernameValidation
                }
            });
            return;
        }

        this.setState({
            username: {
                value: usernameValue,
                validateStatus: 'validating',
                errorMsg: null,
                hasError: false
            }
        });

        checkUsernameAvailability(usernameValue)
            .then(response => {
                if (response.available) {
                    this.setState({
                        username: {
                            value: usernameValue,
                            validateStatus: 'success',
                            errorMsg: null,
                            hasError: false
                        }
                    });
                } else {
                    this.setState({
                        username: {
                            value: usernameValue,
                            validateStatus: 'error',
                            errorMsg: this.props.intl.formatMessage({id: 'signup.form.username.error.taken'}),
                            hasError: true
                        }
                    });
                }
            }).catch(error => {
            // Marking validateStatus as success, Form will be rechecked at server
            this.setState({
                username: {
                    value: usernameValue,
                    validateStatus: 'success',
                    errorMsg: null,
                    hasError: false
                }
            });
        });
    }

    validateEmailAvailability() {
        // First check for client side errors in email
        const emailValue = this.state.email.value;
        const emailValidation = this.validateEmail(emailValue);

        if (emailValidation.validateStatus === 'error') {
            this.setState({
                email: {
                    value: emailValue,
                    ...emailValidation
                }
            });
            return;
        }

        this.setState({
            email: {
                value: emailValue,
                validateStatus: 'validating',
                errorMsg: null,
                hasError: false
            }
        });

        checkEmailAvailability(emailValue)
            .then(response => {
                if (response.available) {
                    this.setState({
                        email: {
                            value: emailValue,
                            validateStatus: 'success',
                            errorMsg: null,
                            hasError: false
                        }
                    });
                } else {
                    this.setState({
                        email: {
                            value: emailValue,
                            validateStatus: 'error',
                            errorMsg: this.props.intl.formatMessage({id: 'signup.form.email.error.taken'}),
                            hasError: true
                        }
                    });
                }
            }).catch(error => {
            // Marking validateStatus as success, Form will be rechecked at server
            this.setState({
                email: {
                    value: emailValue,
                    validateStatus: 'success',
                    errorMsg: null,
                    hasError: false
                }
            });
        });
    }

    validatePasswords() {
        let password = this.state.password.value;
        let passwordConfirm = this.state.passwordConfirm.value;
        if (!password || !passwordConfirm) {
            return;
        }
        if (password === passwordConfirm) {
            this.setState({
                password: {
                    value: password,
                    validateStatus: 'success',
                    errorMsg: null,
                    hasError: false
                },
                passwordConfirm: {
                    value: passwordConfirm,
                    validateStatus: 'success',
                    errorMsg: null,
                    hasError: false
                }
            });
        } else {
            this.setState({
                password: {
                    value: password,
                    validateStatus: 'error',
                    errorMsg: "Passwords are not matching",
                    hasError: true
                },
                passwordConfirm: {
                    value: passwordConfirm,
                    validateStatus: 'error',
                    errorMsg: "Passwords are not matching",
                    hasError: true
                }
            });
        }
    }

}

export default injectIntl(withStyles(styles)(Signup));