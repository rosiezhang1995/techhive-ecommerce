import Chart from "react-apexcharts";
import { useGetUsersQuery } from "../../redux/api/usersApiSlice";
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
} from "../../redux/api/orderApiSlice";

import { useState, useEffect } from "react";
import Loader from "../../components/Loader";
import OrderList from "./OrderList";
import AdminMenu from "./AdminMenu";

const AdminDashboard = () => {
  const { data: sales, isSalesLoading } = useGetTotalSalesQuery();
  const { data: customers, isLoading: isUsersLoading } = useGetUsersQuery();
  const { data: orders, isLoading: isOrdersLoading } = useGetTotalOrdersQuery();
  const { data: salesDetail } = useGetTotalSalesByDateQuery();

  const [state, setState] = useState({
    options: {
      chart:{
        type: "line"
      },
      tooltip: {
        theme: "dark"
      },
      colors: ["#00E396"],
      dataLabels: {
        enabled: true
      },
      stroke: {
        curve: "smooth"
      },
      title: {
        text: "Sales Trend",
        align: "left"
      },
      grid: {
        borderColor: "#ccc"
      },
      markers: {
        size: 1
      },
      xaxis: {
        categories: [],
        title: {
          text: "Date",
        },
      },
      yaxis: {
        title: {
          text: "Sales",
        },
        min: 0,
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        floating: true,
        offsetY: -25,
        offsetX: -5,
      },
    },
    series: [{ name: "Sales", data: [] }],
  });

  useEffect(() => {
    if (salesDetail) {
      // Sort data by date in ascending order
      const sortedSalesDetail = [...salesDetail].sort((a, b) => new Date(a._id) - new Date(b._id));

      // Format sales data for the chart
      const formattedSalesDate = sortedSalesDetail.map((item) => ({
        x: item._id,
        y: item.totalSales,
      }));

      setState((prevState) => ({
        ...prevState,
        options: {
          ...prevState.options,
          xaxis: {
            categories: formattedSalesDate.map((item) => item.x), // Set X-axis labels
          },
        },

        series: [
          { name: "Sales", data: formattedSalesDate.map((item) => item.y) }, // Set Y-axis data
        ],
      }));
    }
  }, [salesDetail]); // Runs when salesDetail changes

  return (
    <>
      <AdminMenu />

      <section className="xl:ml-[4rem] md:ml-[0rem]">
        <div className="w-[80%] flex justify-around flex-wrap">
          <div className="rounded-lg bg-black p-5 w-[20rem] mt-5 flex flex-col items-center justify-center">
            <div className="font-bold rounded-full w-[3rem] bg-pink-500 text-center p-3">
              $
            </div>

            <p className="mt-5">Sales</p>
            <h1 className="text-xl font-bold">
              $ {isSalesLoading ? <Loader /> : sales?.totalSales?.toFixed(2) ?? "0.00"}
            </h1>
          </div>
          <div className="rounded-lg bg-black p-5 w-[20rem] mt-5 flex flex-col items-center justify-center">
            <div className="font-bold rounded-full w-[3rem] bg-pink-500 text-center p-3">
              C
            </div>

            <p className="mt-5">Customers</p>
            <h1 className="text-xl font-bold">
              {isUsersLoading ? <Loader /> : customers?.length}
            </h1>
          </div>
          <div className="rounded-lg bg-black p-5 w-[20rem] mt-5 flex flex-col items-center justify-center">
            <div className="font-bold rounded-full w-[3rem] bg-pink-500 text-center p-3">
              O
            </div>

            <p className="mt-5">All Orders</p>
            <h1 className="text-xl font-bold">
              {isOrdersLoading ? <Loader /> : orders?.totalOrders}
            </h1>
          </div>
        </div>

        <div className="ml-[10rem] mt-[4rem]">
          <Chart
            options={state.options}
            series={state.series}
            type="bar"
            width="70%"
          />
        </div>

        <div className="mt-[4rem]">
          <OrderList />
        </div>
      </section>
    </>
  )
}

export default AdminDashboard
