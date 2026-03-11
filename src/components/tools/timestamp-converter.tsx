"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, fromUnixTime, getUnixTime, isValid, parseISO } from "date-fns";

export function TimestampConverter() {
  const [unixTimestamp, setUnixTimestamp] = useState("");
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    const now = new Date();
    setUnixTimestamp(getUnixTime(now).toString());
    setDateTime(format(now, "yyyy-MM-dd'T'HH:mm"));
  }, []);

  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tsValue = e.target.value;
    setUnixTimestamp(tsValue);
    const numTs = parseInt(tsValue, 10);
    if (!isNaN(numTs) && tsValue.length > 0) {
      const date = fromUnixTime(numTs);
      if (isValid(date)) {
        setDateTime(format(date, "yyyy-MM-dd'T'HH:mm"));
      }
    } else if (tsValue === "") {
        setDateTime("");
    }
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dtValue = e.target.value;
    setDateTime(dtValue);
    const date = parseISO(dtValue);
    if (isValid(date)) {
      setUnixTimestamp(getUnixTime(date).toString());
    } else if (dtValue === "") {
        setUnixTimestamp("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timestamp Converter</CardTitle>
        <CardDescription>
          Convert between Unix timestamps and human-readable dates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="timestamp">Unix Timestamp (seconds)</Label>
          <Input
            id="timestamp"
            placeholder="e.g., 1672531200"
            value={unixTimestamp}
            onChange={handleTimestampChange}
            type="number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="datetime">Date & Time</Label>
          <Input
            id="datetime"
            value={dateTime}
            onChange={handleDateTimeChange}
            type="datetime-local"
          />
        </div>
      </CardContent>
    </Card>
  );
}
