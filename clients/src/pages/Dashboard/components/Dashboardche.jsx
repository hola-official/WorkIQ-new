import React, { useEffect, useState } from 'react';
import ApexCharts from 'apexcharts';
import { formatPrice } from "@/lib/format";
import { useAxiosInstance } from "../../../../api/axios";
import { TbShieldDollar } from "react-icons/tb";
import { FaCircleDollarToSlot } from "react-icons/fa6";
import { useUser } from '@/context/UserContext';
import useAuth from '@/hooks/useAuth';
import { useRecoilState, useRecoilValue } from 'recoil';
import userAtom from '@/atoms/userAtom';

const Dashboardche = () => {
  const { _id } = useAuth();
  // const { user, updateUser } = useUser(null);
  const [userInfo, setUserInfo] = useRecoilState(userAtom)
  const axiosInstance = useAxiosInstance();
  const [chart, setChart] = useState(null);

  useEffect(() => {
    const handleUserInfo = async () => {
      try {
        const res = await axiosInstance.get(`/users/${_id}`);
        // updateUser(prev => prev + 1);
        const data = await res.data;
        console.log(data)
        setUserInfo(data);
        console.log(data);
        // setRefetchDashboard((prev) => ({ ...prev, ...data }));
      } catch (error) {
        console.error(error);
      }
    };
    handleUserInfo();
  }, []);


  useEffect(() => {
    if (userInfo) {
      const chartElement = document.querySelector('#chartline');
      const options = {
        series: [
          {
            name: 'SPEND/WITHDRAW',
            type: 'area',
            data: [44, 55, 31, 47, 31, 43, 26, 41, 31, 47, 33]
          },
          {
            name: 'DEPOSIT',
            type: 'line',
            data: [55, 69, 45, 61, 43, 54, 37, 52, 44, 61, 43]
          }
        ],
        chart: {
          height: 350,
          type: 'line',
          zoom: {
            enabled: false
          }
        },
        stroke: {
          curve: 'smooth'
        },
        fill: {
          type: 'solid',
          opacity: [0.35, 1]
        },
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        markers: {
          size: 0
        },
        yaxis: [
          {
            title: {
              text: 'Series A'
            }
          },
          {
            opposite: true,
            title: {
              text: 'Series B'
            }
          }
        ],
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: y => {
              if (typeof y !== "undefined") {
                return `${y.toFixed(0)} amount`;
              }
              return y;
            }
          }
        }
      };

      if (chart) {
        chart.updateOptions(options);
      } else {
        const chartInstance = new ApexCharts(chartElement, options);
        chartInstance.render();
        setChart(chartInstance);
      }
    }
  }, [userInfo, chart]);

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <section>
      <div className="grid mb-4 pb-10 px-8 mx-4 rounded-3xl bg-gray-100 border-4 border-blue-400">
        <div className="grid grid-cols-12 gap-6">
          <div className="grid grid-cols-12 col-span-12 gap-6 xxl:col-span-9">
            <div className="col-span-12 mt-8">
              <div className="flex items-center h-10 intro-y">
                <h2 className="mr-5 text-lg font-medium truncate">Dashboard</h2>
              </div>
              <h2 className="text-2xl text-gray-600">Hello {userInfo?.username} 👋</h2>
              <div className="grid grid-cols-12 gap-6 mt-5">
                <div className="transform hover:scale-105 transition duration-300 shadow-xl rounded-lg col-span-12 sm:col-span-6 xl:col-span-3 intro-y bg-white">
                  <div className="p-5">
                    <div className="flex justify-between">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <FaCircleDollarToSlot />
                      </svg>
                    </div>
                    <div className="ml-2 w-full flex-1">
                      <div>
                        <div className="mt-3 text-3xl font-bold leading-8">{formatPrice(userInfo?.balance)}</div>
                        <div className="mt-1 text-base text-gray-600">Balance</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="transform hover:scale-105 transition duration-300 shadow-xl rounded-lg col-span-12 sm:col-span-6 xl:col-span-3 intro-y bg-white">
                  <div className="p-5">
                    <div className="flex justify-between">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <TbShieldDollar />
                      </svg>
                    </div>
                    <div className="ml-2 w-full flex-1">
                      <div>
                        <div className="mt-3 text-3xl font-bold leading-8">{formatPrice(userInfo?.escrowBalance)}</div>
                        <div className="mt-1 text-base text-gray-600">Freezed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12 mt-5">
              <div className="bg-white shadow-lg p-4" id="chartline"></div>
              <div className="grid gap-2 grid-cols-1 lg:grid-cols-2">
                {/* <div className="bg-white shadow-lg" id="chartpie"></div> */}
              </div>
            </div>
            <div className="col-span-12 mt-5">
              <div className="grid gap-2 grid-cols-1 lg:grid-cols-1">
                <div className="bg-white p-4 shadow-lg rounded-lg">
                  <h1 className="font-bold text-base">Table</h1>
                  <div className="mt-4">
                    <div className="flex flex-col">
                      <div className="-my-2 overflow-x-auto">
                        <div className="py-2 align-middle inline-block min-w-full">
                          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg bg-white">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                <tr>
                                  <th className="px-6 py-3 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex cursor-pointer">
                                      <span className="mr-2">PRODUCT NAME</span>
                                    </div>
                                  </th>
                                  <th className="px-6 py-3 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex cursor-pointer">
                                      <span className="mr-2">Stock</span>
                                    </div>
                                  </th>
                                  <th className="px-6 py-3 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex cursor-pointer">
                                      <span className="mr-2">STATUS</span>
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {/* Replace with your data */}
                                <tr>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                                    <p>Product 1</p>
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                                    <p>20</p>
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                                    <div className="flex text-green-500">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4m-6 6v6m-3-6h6m6-6V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2H9m-4 4v6h6" />
                                      </svg>
                                      <p>active</p>
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                                    <p>Product 2</p>
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                                    <p>15</p>
                                  </td>
                                  <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                                    <div className="flex text-red-500">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4m-6 6v6m-3-6h6m6-6V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2H9m-4 4v6h6" />
                                      </svg>
                                      <p>inactive</p>
                                    </div>
                                  </td>
                                </tr>
                                {/* Add more rows as needed */}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="bg-white shadow-lg" id="chartpie"></div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboardche;
