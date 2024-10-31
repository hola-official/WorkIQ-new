import { Button } from "@/components/ui/button";
import { forwardRef } from "react";


export const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <Button 
      onClick={onClick} 
      ref={ref}
      variant="outline"
      className="w-full px-5 justify-start text-left font-normal"
    >
      {value || "Select date range"}
    </Button>
  ));