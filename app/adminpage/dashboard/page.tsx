"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ListFilter
} from "lucide-react"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  Rectangle,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components//ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components//ui/chart"
import { Separator } from "@/components//ui/separator"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


import SideBar from "@/components/sideBar/sidebar";

export default function DashBoard() {
  const fullname = sessionStorage.fullname;
  const userId = sessionStorage.userId;
  const roleId = sessionStorage.roleId

  const router = useRouter();

  useEffect(() => {
    // Redirect if sessionStorage values are missing
    if (!fullname || !userId || roleId != 1) {
      sessionStorage.clear();
      router.push('/'); // Redirect to login page or any other page
    }
  }, [fullname, userId, roleId, router]);

  const [filter, setFilter] = useState('week');

  const data = {
    week: [
      { date: "2024-01-01", sales: 2000 },
      { date: "2024-01-02", sales: 2100 },
      { date: "2024-01-03", sales: 2200 },
      { date: "2024-01-04", sales: 1300 },
      { date: "2024-01-05", sales: 1400 },
      { date: "2024-01-06", sales: 2500 },
      { date: "2024-01-07", sales: 1600 },
    ],
    month: [
      { date: "2024-01-01", sales: 5000 },
      { date: "2024-01-08", sales: 6000 },
      { date: "2024-01-15", sales: 4500 },
      { date: "2024-01-22", sales: 7000 },
    ],
    year: [
      { date: "2024-01-01", sales: 20000 },
      { date: "2024-02-01", sales: 21000 },
      { date: "2024-03-01", sales: 22000 },
      { date: "2024-04-01", sales: 13000 },
      { date: "2024-05-01", sales: 14000 },
      { date: "2024-06-01", sales: 25000 },
      { date: "2024-07-01", sales: 16000 },
      { date: "2024-08-01", sales: 18000 },
      { date: "2024-09-01", sales: 19000 },
      { date: "2024-10-01", sales: 17000 },
      { date: "2024-11-01", sales: 21000 },
      { date: "2024-12-01", sales: 22000 },
    ]
  };

  const getTickFormatter = () => {
    if (filter === 'week') {
      return (value: any) => new Date(value).toLocaleDateString("en-US", { weekday: "short" });
    } else if (filter === 'month') {
      return (value: any) => {
        const weekNumber = Math.ceil(new Date(value).getDate() / 7);
        return `${weekNumber} ${weekNumber === 1 ? 'st' : weekNumber === 2 ? 'nd' : weekNumber === 3 ? 'rd' : 'th'} Week`;
      };
    } else if (filter === 'year') {
      return (value: any) => new Date(value).toLocaleDateString("en-US", { month: "long" });
    }
  };

  return (
    <div className="chart-wrapper mx-auto flex max-w-6xl flex-col flex-wrap items-start justify-center gap-6 p-6 sm:flex-row sm:p-8">
        <SideBar />
      <div className="grid w-full gap-6 sm:grid-cols-2 lg:max-w-[22rem] lg:grid-cols-1 xl:max-w-[25rem]">
      <Card className="lg:max-w-md" x-chunk="charts-01-chunk-0">
      <CardHeader className="space-y-0 pb-2">
        <div className='flex justify-between'>
          <div>
            <CardDescription>Sales this {filter.charAt(0).toUpperCase() + filter.slice(1)}</CardDescription>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <ListFilter />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white shadow-lg rounded p-2">
                <DropdownMenuItem onClick={() => setFilter('week')}>Week</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('month')}>Month</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('year')}>Year</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
        </div>
        
        <CardTitle className="text-4xl tabular-nums">₱12,584</CardTitle>
        <div className="mt-2">
          
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{ sales: { label: "Sales", color: "hsl(var(--chart-1))" } }}>
          <BarChart
            accessibilityLayer
            margin={{ left: -4, right: -4 }}
            data={data[filter as 'week' | 'month' | 'year']}
          >
            <Bar
              dataKey="sales"
              fill="var(--color-sales)"
              radius={5}
              fillOpacity={0.6}
              activeBar={<Rectangle fillOpacity={0.8} />}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tickFormatter={getTickFormatter()}
            />
            <ChartTooltip
              defaultIndex={2}
              content={
                <ChartTooltipContent
                  hideIndicator
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    });
                  }}
                />
              }
              cursor={false}
            />

          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1">
        <CardDescription>
          Over the past {filter}, you have made sales totaling{" "}
          <span className="font-medium text-foreground">₱53,305</span>.
        </CardDescription>
      </CardFooter>
      </Card>

      </div>
      <div className="grid w-full flex-1 gap-6 lg:max-w-[20rem]">
        <Card
          className="max-w-xs" x-chunk="charts-01-chunk-3"
        >
          <CardHeader className="p-4 pb-0">
            <CardTitle>Products</CardTitle>
            <CardDescription>
              This is the number of products.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0">
            <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
              69
              <span className="text-sm font-normal text-muted-foreground">
                products
              </span>
            </div>
          </CardContent>
        </Card>
        <Card
          className="max-w-xs" x-chunk="charts-01-chunk-4"
        >
          <CardHeader className="p-4 pb-0">
            <CardDescription>
              This is the top-selling products.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 p-4 pb-2">
            <ChartContainer
              config={{
                shabu: {
                  label: "Shabu",
                  color: "hsl(var(--chart-1))",
                },
                condom: {
                  label: "Condom",
                  color: "hsl(var(--chart-2))",
                },
                bulad: {
                  label: "Bulad",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[140px] w-full"
            >
              <BarChart
                margin={{
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 10,
                }}
                data={[
                  {
                    product: "shabu",
                    value: (8 / 12) * 100,
                    label: "69 packs",
                    fill: "var(--color-shabu)",
                  },
                  {
                    product: "condom",
                    value: (46 / 60) * 100,
                    label: "46 boxes",
                    fill: "var(--color-condom)",
                  },
                  {
                    product: "bulad",
                    value: (245 / 360) * 100,
                    label: "143 pcs",
                    fill: "var(--color-bulad)",
                  },
                ]}
                layout="vertical"
                barSize={32}
                barGap={2}
              >
                <XAxis type="number" dataKey="value" hide />
                <YAxis
                  dataKey="product"
                  type="category"
                  tickLine={false}
                  tickMargin={4}
                  axisLine={false}
                  className="capitalize"
                />
                <Bar dataKey="value" radius={5}>
                  <LabelList
                    position="insideLeft"
                    dataKey="label"
                    fill="white"
                    offset={8}
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid w-full flex-1 gap-6">
      <Card x-chunk="dashboard-01-chunk-5">
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              <div className="flex items-center gap-4">
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Olivia Martin
                  </p>
                  <p className="text-sm text-muted-foreground">
                    olivia.martin@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">+$1,999.00</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Jackson Lee
                  </p>
                  <p className="text-sm text-muted-foreground">
                    jackson.lee@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">+$39.00</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Isabella Nguyen
                  </p>
                  <p className="text-sm text-muted-foreground">
                    isabella.nguyen@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">+$299.00</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    William Kim
                  </p>
                  <p className="text-sm text-muted-foreground">
                    will@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">+$99.00</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Sofia Davis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    sofia.davis@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">+$39.00</div>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
