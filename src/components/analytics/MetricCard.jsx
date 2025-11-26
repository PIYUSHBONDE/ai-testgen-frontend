// src/components/analytics/MetricCard.jsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion' // Animation wrapper
import CountUp from 'react-countup'    // Number animation

export default function MetricCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  trendLabel,
  trendPositive = true,
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay }}
    >
      <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">
             {/* Check if value is a number to animate, otherwise just show it */}
             {typeof value === 'number' ? (
                <CountUp end={value} duration={2} separator="," />
             ) : (
                value
             )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          </div>
          {trend !== null && (
            <div className="flex items-center gap-1 mt-2">
              {trendPositive ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={`text-xs font-medium ${trendPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">{trendLabel}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
