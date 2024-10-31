"use client";
import * as z from "zod";
// import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Button,
  Alert,
  AlertIcon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import useShowToast from "@/hooks/useShowToast";
import { useAxiosInstance } from "../../../../../../../api/axios";

const formSchema = z.object({
  price: z.coerce.number(),
});
export const SectionPriceForm = ({
  initialData,
  taskId,
  setRefetchSection,
  sectionId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [priceError, setPriceError] = useState("");
  const [price, setPrice] = useState("");
  const { showToast } = useShowToast();
  const axiosInstance = useAxiosInstance();
  const toggleEdit = () => setIsEditing((current) => !current);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: initialData?.price || undefined,
    },
  });
  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values) => {
    console.log(values);
    const price = parseFloat(values.price);
    if (price < 5) {
      return setPriceError("Price must be at least $5");
      // console.log(price);
      // console.log(priceError);
    }
    try {
      await axiosInstance.put(
        `/tasks/edit-task/${taskId}/section/${sectionId}`,
        values
      );
      showToast("Success", "Task updated successfully", "success");
      toggleEdit();
      setRefetchSection(prev => prev + 1)
      // router.refresh();
    } catch (error) {
      console.log('price error goes here', error);
      showToast(
        "Error",
        error.response.data.message || error.response.data.error,
        "error"
      );
    }
  };

  useEffect(() => {
    if (!isEditing) {
      setPriceError("");
    }
  }, [isEditing]);

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Task price
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit price
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <div>
          <p
            className={cn(
              "text-sm mt-2",
              !initialData.price && "text-slate-500 italic"
            )}
          >
            {initialData.price ? formatPrice(initialData.price) : "Free"}
          </p>
          <div className="text-xs text-muted-foreground mt-4">
            You can adjust the price as per your budget.
          </div>
        </div>
      )}

      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputGroup>
                      <InputLeftElement
                        pointerEvents="none"
                        // color='gray.300'
                        fontSize="1.2em"
                      >
                        $
                      </InputLeftElement>
                      {/* <Input placeholder='Enter amount' /> */}
                      <Input
                        colorScheme={"blue"}
                        type="number"
                        step="0.01"
                        isDisabled={isSubmitting}
                        min={5} // Minimum price of $5
                        placeholder="Set a price for your task"
                        // onChange={handlePriceChange}
                        {...field}
                      />
                      {Number(form.getValues().price) >= 5 && (
                        <InputRightElement>
                          <CheckIcon color="blue.500" />
                        </InputRightElement>
                      )}
                    </InputGroup>
                  </FormControl>
                  {/* {priceError && (
						<FormMessage className="text-red-500">{priceError}</FormMessage>
					)} */}
                  {priceError && (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      {priceError}
                    </Alert>
                  )}
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button
                colorScheme="blue"
                isDisabled={!isValid || isSubmitting}
                type="submit"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
