"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value: number[];
    min: number;
    max: number;
    step?: number;
    onValueChange: (vals: number[]) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, value, min, max, step = 1, onValueChange, ...props }, ref) => {

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onValueChange([parseFloat(e.target.value)]);
        };

        const val = value[0] || min;
        const percentage = ((val - min) * 100) / (max - min);

        return (
            <div className={cn("relative flex w-full touch-none select-none items-center h-5", className)}>
                {/* Invisible Real Input */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={val}
                    onChange={handleChange}
                    ref={ref}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                    {...props}
                />

                {/* Visual Track */}
                <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-zinc-800">
                    <div
                        className="absolute h-full bg-white"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {/* Visual Thumb */}
                <div
                    className="absolute h-4 w-4 rounded-full border border-zinc-200 bg-white shadow-sm transition-colors z-10 pointer-events-none"
                    style={{ left: `calc(${percentage}% - 8px)` }}
                />
            </div>
        );
    }
);

Slider.displayName = "Slider";

export { Slider };
