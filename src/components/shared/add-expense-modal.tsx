
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Clock, Edit, Plus, Upload, Calendar } from "lucide-react";
import { format, parse, parseISO } from "date-fns";
import { v4 as uuidv4 } from 'uuid';

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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/use-transactions";
import { ScrollArea } from "../ui/scroll-area";
import { useCurrency } from "@/hooks/use-currency";

const formSchema = z.object({
  type: z.enum(['expense', 'income']),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0.").optional().or(z.literal('')),
  category: z.string().min(1, "Category is required."),
  title: z.string().min(1, "Title is required."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)."),
  description: z.string().optional(),
});


interface AddExpenseModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const { toast } = useToast();
  const { currencySymbol } = useCurrency();
  const { 
    addTransaction, 
    isAddExpenseModalOpen: contextIsOpen,
    setAddExpenseModalOpen: contextSetIsOpen,
    editingTransaction,
    setEditingTransaction,
    updateTransaction,
  } = useTransactions();

  const isControlled = typeof isOpen === 'boolean';
  const effectiveIsOpen = isControlled ? isOpen : contextIsOpen;
  const effectiveOnClose = isControlled && onClose ? onClose : () => contextSetIsOpen(false);

  const isEditing = !!editingTransaction;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        type: 'expense',
        amount: '',
        category: "",
        title: "",
        date: "",
        time: "",
        description: "",
    }
  });

  useEffect(() => {
    if (effectiveIsOpen) {
      if (isEditing && editingTransaction) {
        const transactionDate = parseISO(editingTransaction.date);
        
        form.reset({
          type: editingTransaction.type,
          title: editingTransaction.title,
          amount: editingTransaction.amount,
          category: editingTransaction.category,
          date: format(transactionDate, "yyyy-MM-dd"),
          time: format(transactionDate, "HH:mm"),
          description: editingTransaction.description || '',
        });
      } else {
        const now = new Date();
        form.reset({
          type: 'expense',
          amount: '',
          category: "",
          title: "",
          date: format(now, "yyyy-MM-dd"),
          time: format(now, "HH:mm"),
          description: "",
        });
      }
    }
  }, [effectiveIsOpen, isEditing, editingTransaction, form]);

  const quickAdd = (amount: number) => {
    const currentAmount = form.getValues("amount") || 0;
    if (typeof currentAmount === 'number') {
      form.setValue("amount", currentAmount + amount, { shouldValidate: true });
    } else {
      form.setValue("amount", amount, { shouldValidate: true });
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const transactionDateTime = parse(`${values.date} ${values.time}`, 'yyyy-MM-dd HH:mm', new Date());

    const newTransaction = {
      id: isEditing ? editingTransaction.id : uuidv4(),
      type: 'expense' as 'expense' | 'income',
      title: values.title,
      amount: Number(values.amount),
      category: values.category,
      date: transactionDateTime.toISOString(),
      description: values.description,
    };

    if (isEditing) {
      updateTransaction(newTransaction);
      toast({
        title: "Expense Updated",
        description: `Your expense has been successfully updated.`,
      });
    } else {
      addTransaction(newTransaction);
      
      toast({
        title: `Expense Added`,
        description: `${currencySymbol}${values.amount} for ${values.category} has been logged.`,
      });
    }

    handleClose();
  }

  const handleClose = () => {
    form.reset();
    setEditingTransaction(null);
    effectiveOnClose();
  }

  return (
    <Dialog open={effectiveIsOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of your expense.' : 'Log a new expense to keep your finances up to date.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                          <Input placeholder="e.g., Weekly Groceries" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">{currencySymbol}</span>
                        <Input type="number" step="0.01" placeholder="0.00" className="pl-8" {...field} />
                      </div>
                    </FormControl>
                    <div className="flex gap-2 pt-1">
                      {[100, 200, 500, 1000].map(val => (
                          <Button key={val} type="button" variant="outline" size="sm" onClick={() => quickAdd(val)}>
                              +{val}
                          </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Groceries or Travel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input type="date" className="pl-9" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input type="time" className="pl-9" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Coffee with Sarah" {...field} value={field.value || ''}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Keep this invisible submit button to allow form submission with enter key */}
              <button type="submit" className="hidden" />
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter className="sm:justify-between gap-2 mt-4 flex-shrink-0">
            <Button variant="outline" type="button" className="w-full sm:w-auto">
                <Upload className="mr-2 h-4 w-4" />
                Upload Receipt
            </Button>
            <Button type="button" onClick={form.handleSubmit(onSubmit)} className="w-full sm:w-auto">
                {isEditing ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                {isEditing ? 'Save Changes' : 'Save Expense'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
