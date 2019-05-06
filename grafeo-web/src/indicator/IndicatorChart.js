import React, {Component} from 'react';
import {Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {getRandomColorValue} from "../util/Colors";
import moment from "moment";
import {injectIntl} from "react-intl";
import {Button, FormControl, Grid, MenuItem, Paper, Select, Typography, withStyles} from '@material-ui/core';

const dateFormat = 'YYYY-MM-DD';
const chartDateFormat = 'LL';

const selectGridSize = {
    xs: 12,
    sm: 4,
    md: 4,
    lg: 3,
};
const statisticGridSize = {
    xs: 6,
    sm: 4,
    md: 4,
    lg: 3,
};
const tooltipStyle = {
    position: "absolute",
    bottom: "0%",
    marginTop: "10px",
};
const progressStyle = {
    color: '#3f51b5',
};
const redTextStyle = {
    color: 'red',
};
const greenTextStyle = {
    color: 'green',
};
const styles = theme => ({
    root: {
        marginTop: theme.spacing.unit,
    },
    chart: {
        height: '300px',
        marginTop: theme.spacing.unit,
        borderRadius: '15px',
        overflow: 'hidden'
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120,
    },
    statisticText: {
        margin: theme.spacing.unit,
        // minWidth: 120,
    },
    selectEmpty: {},
});

class IndicatorChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startFromFirst: true,
            endInLast: true,
            period: 'all',
            emptyLeft: false,
            emptyRight: false
        };
        this.handleClick = this.handleClick.bind(this);
        this.getChartData = this.getChartData.bind(this);
        this.formatYAxis = this.formatYAxis.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSwitchChange = this.handleSwitchChange.bind(this);
    }

    handleClick(event) {
        if (this.props.onClickHandler) {
            this.props.onClickHandler(event.payload)
        }
    }

    componentWillMount() {
        this.setState(
            {
                data: this.props.data,
            }
        );
        let currentDuration = localStorage.getItem('indicator_' + this.props.indicator.id + '_period');
        if (currentDuration) {
            this.setState(
                {
                    period: currentDuration,
                }
            );
        }
    }

    getChartData() {
        if (this.props.data.length === 0) {
            return [];
        }
        let {emptyLeft, emptyRight, period} = this.state;
        let periodLength;
        if (period === 'all') {
            periodLength = 365;
            emptyLeft = false;
        } else if (period === 'week') {
            periodLength = 7;
        } else if (period === 'month') {
            periodLength = 30;
        } else if (period === 'year') {
            periodLength = 365;
        } else if (period === '3m') {
            periodLength = 91;
        } else if (period === '6m') {
            periodLength = 183;
        }
        let data = this.props.data.map(r => ({...r}));
        let dates = data.map(d => d['date']);
        const first = moment(data[0]['date']);
        let finish = moment(data[data.length - 1]['date']);
        const now = moment().startOf('day');
        now.add(1, 'days');
        if (emptyRight) {
            finish = now;
        }
        let periodAgo = moment(finish).subtract(periodLength, 'days');
        let start = first;
        if (emptyLeft && first.isAfter(periodAgo)) {
            start = periodAgo
        }
        for (let m = moment(start); m.isBefore(finish); m.add(1, 'days')) {
            if (!dates.includes(m.format(dateFormat))) {
                data.push({
                    date: m.format(dateFormat),
                    value: null
                })
            }
        }

        data.sort(IndicatorChart.compare);

        if (period === 'all') {
            return data
        } else {
            let periodData = data.slice(Math.max(0, data.length - periodLength));
            if (!emptyLeft) {
                let i = 0;
                for (let item of periodData) {
                    if (item.value != null) {
                        break;
                    } else {
                        i++;
                    }
                }
                periodData = periodData.slice(i);
            }
            return periodData;
        }
    }

    getProgressText(chartData) {
        let firstValue = chartData[0].value;
        let lastValue = chartData[chartData.length - 1].value;
        let delta;
        if (firstValue !== 0) {
            delta = (lastValue - firstValue) / firstValue;
            delta = delta * 100;
            delta = Math.ceil(delta * 100) / 100;
        } else {
            delta = null;
        }
        let deltaStyle;
        if (delta != null) {
            if (delta > 0) {
                deltaStyle = greenTextStyle;
            } else {
                deltaStyle = redTextStyle;
            }
            return <text>
                <b style={progressStyle}>{this.props.intl.formatNumber(firstValue)} → {this.props.intl.formatNumber(lastValue)}</b>
                <b style={deltaStyle}> ({this.props.intl.formatNumber(delta)}%) </b>
            </text>
        }
        return <text>
            <b style={progressStyle}>{this.props.intl.formatNumber(firstValue)} → {this.props.intl.formatNumber(lastValue)} </b>
        </text>
    }

    getMinMaxText(min, max) {
        return <text>
            <b style={redTextStyle}> min: {this.props.intl.formatNumber(min)}</b>
            <b> - </b>
            <b style={greenTextStyle}> max: {this.props.intl.formatNumber(max)} </b>
        </text>
    }

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value});
        localStorage.setItem('indicator_' + this.props.indicator.id + '_period', event.target.value);
    };

    handleSwitchChange = name => event => {
        this.setState({[name]: event.target.checked});
    };

    static compare(a, b) {
        if (a.date < b.date)
            return -1;
        if (a.date > b.date)
            return 1;
        return 0;
    }

    formatYAxis(tickItem) {
        return this.props.intl.formatNumber(tickItem);
    }

    formatXAxis(tickItem) {
        return moment(tickItem, dateFormat).format(chartDateFormat);
    }

    render() {
        let chartData = this.getChartData();
        let chartColor = "#FFF";
        let chartBackColor = getRandomColorValue(this.props.name);

        if (chartData.length === 0) {
            return null;
        }
        let {classes} = this.props;
        let xTicks = [];
        let minY = Number.MAX_VALUE;
        let maxY = Number.MIN_VALUE;
        for (let rec of chartData) {
            let value = rec.value;
            if (value) {
                xTicks.push(rec.date);
                if (value < minY) {
                    minY = value;
                }
                if (value > maxY) {
                    maxY = value;
                }
            }
        }
        let lastValue = chartData[chartData.length - 1].value;
        return (
            <div className={classes.root}>
                <div className={classes.chart} style={{background: chartBackColor}}>
                    <ResponsiveContainer>
                        <AreaChart
                            data={chartData}
                            margin={{top: 0, right: 0, bottom: 0, left: 0}}>
                            <CartesianGrid strokeDasharray="1" vertical={true}/>
                            <XAxis dataKey="date" tick={{stroke: '#BDBDBD'}} hide
                                   tickFormatter={this.formatXAxis} ticks={xTicks}/>
                            <YAxis orientation="left" mirror={true} axisLine={false} domain={['auto', 'auto']} hide
                                   tick={{stroke: '#BDBDBD'}} tickFormatter={this.formatYAxis}
                            />
                            <Tooltip content={<CustomTooltipWrapped unit={this.props.unit}/>}
                                     offset={0} wrapperStyle={tooltipStyle}
                                     cursor={{stroke: '#3949AB', strokeWidth: 2, strokeDasharray: "2 2"}}/>
                            <ReferenceLine y={lastValue} strokeDasharray="3 3" stroke="white"/>
                            <Area type="monotone"
                                  dataKey="value"
                                  stroke={chartColor}
                                  fill={chartColor}
                                  fillOpacity={0.7}
                                  strokeWidth={2}
                                  connectNulls={true}
                                  activeDot={{r: 3, onClick: this.handleClick}}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <Grid container justify='flex-start'>
                    <Grid item {...selectGridSize}>
                        <FormControl className={classes.formControl}>
                            <Select
                                value={this.state.period}
                                onChange={this.handleChange}
                                name="period"
                                className={classes.selectEmpty}
                                autoWidth
                            >
                                <MenuItem
                                    value={'all'}>{this.props.intl.formatMessage({id: 'indicator.view.chart.form.select.all'})}</MenuItem>
                                <MenuItem
                                    value={'year'}>{this.props.intl.formatMessage({id: 'indicator.view.chart.form.select.year'})}</MenuItem>
                                <MenuItem
                                    value={'6m'}>{this.props.intl.formatMessage({id: 'indicator.view.chart.form.select.m6'})}</MenuItem>
                                <MenuItem
                                    value={'3m'}>{this.props.intl.formatMessage({id: 'indicator.view.chart.form.select.m3'})}</MenuItem>
                                <MenuItem
                                    value={'month'}>{this.props.intl.formatMessage({id: 'indicator.view.chart.form.select.month'})}</MenuItem>
                                <MenuItem
                                    value={'week'}>{this.props.intl.formatMessage({id: 'indicator.view.chart.form.select.week'})}</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item {...statisticGridSize}>
                        <Button disabled fullWidth
                                className={classes.statisticText}> {this.getProgressText(chartData)}</Button>
                    </Grid>
                    <Grid item {...statisticGridSize}>
                        <Button disabled fullWidth
                                className={classes.statisticText}>{this.getMinMaxText(minY, maxY)}</Button>
                    </Grid>
                </Grid>
            </div>
        )
    }
}

const tooltipStyles = theme => ({
    root: {
        paddingLeft: '5px',
        paddingRight: '5px'
    },
});

class CustomTooltip extends React.Component {

    render() {
        const {classes} = this.props;
        const {active} = this.props;

        if (active) {
            const {payload, label, unit} = this.props;
            if (payload && payload.length > 0 && label) {
                return (
                    <Paper className={classes.root}>
                        <Typography component="p" style={{verticalAlign: 'middle'}}>
                            {this.getLabelDate(label)}
                        </Typography>
                        <Typography component="p">
                            {this.getUnitValue(payload, unit)}
                        </Typography>
                    </Paper>
                )
            }
        }

        return null;
    }

    getLabelDate(label) {
        return moment(label, dateFormat).format(chartDateFormat);
    }

    getUnitValue(payload, unit) {
        return <span>
            <span>{this.props.intl.formatNumber(payload[0].value)} </span>
            <span style={{fontWeight: '600'}}>{unit} </span>
        </span>;
    }
}

const CustomTooltipWrapped = injectIntl(withStyles(tooltipStyles, {withTheme: true})(
    CustomTooltip,
));

export default injectIntl(withStyles(styles)(IndicatorChart));