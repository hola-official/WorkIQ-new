import React, { useEffect, useState, useMemo, useCallback } from 'react';
import ReactApexChart from 'react-apexcharts';
import DatePicker from 'react-datepicker';
import { format, subDays, isValid, parseISO, isWithinInterval } from 'date-fns';
import { CustomInput } from './CustomInput';

const FreelancerEarningsChart = ({ stats }) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const [dateRange, setDateRange] = useState([subDays(new Date(), 30), new Date()]);
  const [startDate, endDate] = dateRange;

  const handleDateChange = useCallback((update) => {
    setDateRange(update);
  }, []);

  const processedData = useMemo(() => {
    if (!stats || !stats.recentTransactions) return [];

    const earnings = {};
    const deposits = {};
    const withdrawals = {};

    stats.recentTransactions.forEach((transaction) => {
      const date = parseISO(transaction.createdAt);
      if (isValid(date) && isWithinInterval(date, { start: startDate, end: endDate })) {
        const formattedDate = format(date, 'yyyy-MM-dd');
        if (transaction.type === 'earning') {
          if (!earnings[formattedDate]) earnings[formattedDate] = 0;
          earnings[formattedDate] += transaction.amount;
        } else if (transaction.type === 'deposit') {
          if (!deposits[formattedDate]) deposits[formattedDate] = 0;
          deposits[formattedDate] += transaction.amount;
        } else if (transaction.type === 'withdrawal') {
          if (!withdrawals[formattedDate]) withdrawals[formattedDate] = 0;
          withdrawals[formattedDate] += transaction.amount;
        }
      }
    });

    const allDates = new Set([...Object.keys(earnings), ...Object.keys(deposits), ...Object.keys(withdrawals)]);

    return Array.from(allDates).map((date) => ({
      date,
      earning: earnings[date] || 0,
      deposit: deposits[date] || 0,
      withdrawal: withdrawals[date] || 0,
    }));
  }, [stats, startDate, endDate]);

  const chartData = useMemo(() => {
    const dataByMonth = Array(12).fill().map(() => ({ earning: 0, deposit: 0, withdrawal: 0 }));

    processedData.forEach((item) => {
      const monthIndex = new Date(item.date).getMonth();
      dataByMonth[monthIndex].earning += item.earning;
      dataByMonth[monthIndex].deposit += item.deposit;
      dataByMonth[monthIndex].withdrawal += item.withdrawal;
    });

    const currentMonthIndex = new Date().getMonth();
    const offset = 12 - (currentMonthIndex + 1);

    const shiftedDataByMonth = [...dataByMonth.slice(-offset), ...dataByMonth.slice(0, -offset)];
    const shiftedMonthNames = [...monthNames.slice(-offset), ...monthNames.slice(0, -offset)];

    const earningsData = shiftedDataByMonth.map((item) => item.earning);
    const depositsData = shiftedDataByMonth.map((item) => item.deposit);
    const withdrawalsData = shiftedDataByMonth.map((item) => item.withdrawal);

    return {
      series: [
        {
          name: 'Earnings',
          data: earningsData.some((value) => value !== 0) ? earningsData : [0],
        },
        {
          name: 'Deposits',
          data: depositsData.some((value) => value !== 0) ? depositsData : [0],
        },
        {
          name: 'Withdrawals',
          data: withdrawalsData.some((value) => value !== 0) ? withdrawalsData : [0],
        },
      ],
      options: {
        chart: {
          type: 'bar',
          height: 350,
          // stacked: false,
        },
        stroke: {
          curve: 'smooth',
          width: 3,
        },
        plotOptions: {
          bar: {
            distributed: true
          }
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: shiftedMonthNames,
        },
        yaxis: {
          title: {
            text: '$ (USD)',
          },
          labels: {
            formatter: function (value) {
              return `$${value.toFixed(2)}`;
            },
          },
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.9,
            stops: [0, 90, 100]
          }
        },
        colors: ['#4CAF50', '#2196F3', '#F44336'],
        tooltip: {
          y: {
            formatter: function (val) {
              return `$${val.toFixed(2)}`;
            },
          },
        },
        legend: {
          position: 'top',
        },
      },
    };
  }, [processedData]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4 flex md:flex-col md:gap-3 justify-between">
        <DatePicker
          selectsRange={true}
          dateFormat="d/MM/yyyy"
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
          customInput={<CustomInput />}
        />
      </div>
      {processedData.length > 0 ? (
        <ReactApexChart options={chartData.options} series={chartData.series} type="bar" height={350} />
      ) : (
        <p className="text-center mt-20">No data to display for the selected date range</p>
      )}
    </div>
  );
};

export default React.memo(FreelancerEarningsChart);
