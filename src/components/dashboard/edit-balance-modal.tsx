
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useCurrency } from "@/hooks/use-currency";

const formSchema = z.object({
  balance: z.coerce.number(),
});

type EditBalanceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
  title: string;
  currentBalance: number;
};

export default function EditBalanceModal({
  isOpen,
  onClose,
  onUpdateBalance,
  title,
  currentBalance,
}: EditBalanceModalProps) {
  const { currencySymbol } = useCurrency();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      balance: currentBalance,
    },
  });

  useEffect(() => {
    if (isOpen) {
        form.reset({ balance: currentBalance });
    }
  }, [isOpen, currentBalance, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    onUpdateBalance(values.balance);
    handleClose();
  }

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Set a new value. An adjustment transaction will be created.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Balance</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        step="100"
                        placeholder="e.g., 50000"
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Update Balance
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
