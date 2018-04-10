import React, {Component} from 'react';
import {getUserProfile} from '../../util/APIUtils';
import LoadingIndicator from '../../common/LoadingIndicator';
import './Profile.css';
import NotFound from '../../common/NotFound';
import ServerError from '../../common/ServerError';
import {FormattedDate, FormattedMessage, injectIntl} from 'react-intl';
import {AppBar, Avatar, Grid, Tab, Tabs, Typography, withStyles} from "material-ui";
import {getRandomColor} from "../../util/Colors";
import IndicatorList from "../../indicator/IndicatorList";

function TabContainer(props) {
    return (
        <Typography component="div">
            {props.children}
        </Typography>
    );
}

const styles = theme => ({
    root: {
        flexGrow: 1,
        marginTop: theme.spacing.unit * 3,
        backgroundColor: theme.palette.background.paper,
    },
    bigAvatar: {
        width: 120,
        height: 120,
        fontSize: 50
    },
});

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            isLoading: false,
            tab: 0
        };
        this.loadUserProfile = this.loadUserProfile.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
    }

    loadUserProfile(username) {
        this.setState({
            isLoading: true
        });

        getUserProfile(username)
            .then(response => {
                this.setState({
                    user: response,
                    isLoading: false
                });
                document.title = this.state.user.name;
            }).catch(error => {
            if (error.status === 404) {
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
        });
    }

    componentDidMount() {
        const username = this.props.match.params.username;
        this.loadUserProfile(username);
        document.title = this.props.intl.formatMessage({id: 'profile.title'});
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.match.params.username !== nextProps.match.params.username) {
            this.loadUserProfile(nextProps.match.params.username);
        }
    }


    handleTabChange = (event, tab) => {
        this.setState({
            tab: tab
        });
    };

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
        const {tab} = this.state;

        return (
            <div>
                {
                    this.state.user ? (
                        <div>
                            <div style={{padding: 24, background: '#f1f1f1'}}>
                                <Grid container style={{paddingTop: 10, paddingBottom: 10}}
                                      className="user-details" align="center"
                                      spacing={24}>
                                    <Grid item xs={12} sm={4} md={4} align="center">
                                        <Avatar
                                            className={classes.bigAvatar}
                                            style={{backgroundColor: getRandomColor(this.state.user.name)}}>
                                            {this.state.user.name[0].toUpperCase()}
                                        </Avatar>
                                    </Grid>
                                    <Grid item xs={12} sm={8} md={8} className="user-summary">
                                        <div className="full-name">{this.state.user.name}</div>
                                        <div className="username">@{this.state.user.username}</div>
                                        <div className="user-joined">
                                            <FormattedMessage id="profile.joined" values={{
                                                date: <FormattedDate
                                                    value={new Date(this.state.user.joinedAt)}
                                                    year='numeric'
                                                    month='long'
                                                    day='2-digit'
                                                />
                                            }}/>
                                        </div>
                                    </Grid>
                                </Grid>
                            </div>
                            <div>
                                <AppBar position="static" color='inherit' style={{backgroundColor: '#F1F1F1'}}>
                                    <Tabs value={tab} onChange={this.handleTabChange} centered>
                                        <Tab label={this.props.intl.formatMessage({id: 'profile.indicators'})}/>
                                        <Tab label={this.props.intl.formatMessage({id: 'profile.records'})}/>
                                    </Tabs>
                                </AppBar>
                                {tab === 0 && <TabContainer>
                                    <IndicatorList isAuthenticated={this.props.isAuthenticated}
                                                   currentUser={this.props.currentUser}
                                                   type="USER_CREATED_INDICATORS"/>
                                </TabContainer>}
                                {tab === 1 && <TabContainer>
                                </TabContainer>}
                            </div>
                        </div>
                    ) : null
                }
            </div>
        );
    }
}

export default injectIntl(withStyles(styles)(Profile));