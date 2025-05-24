'use client';

import * as React from 'react';
import { 
  useForm, 
  SubmitHandler, 
  UseFormReturn, 
  FormProvider as HookFormProvider,
  DefaultValues,
  FieldValues
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';

type FormProps<TFormValues extends Record<string, any>> = {
  className?: string;
  onSubmit: SubmitHandler<TFormValues>;
  children: (methods: UseFormReturn<TFormValues>) => React.ReactNode;
  schema: z.ZodSchema<TFormValues>;
  defaultValues?: DefaultValues<TFormValues>;
  id?: string;
};

export function Form<FormValues extends Record<string, any>>({
  className,
  onSubmit,
  children,
  schema,
  defaultValues,
  id,
}: FormProps<FormValues>) {
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <HookFormProvider {...methods}>
      <form
        id={id}
        className={cn('space-y-6', className)}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        {children(methods)}
      </form>
    </HookFormProvider>
  );
}

type FormFieldProps = {
  className?: string;
  label?: string;
  name: string;
  description?: string;
  children: React.ReactNode;
};

export function FormField({
  className,
  label,
  name,
  description,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
      {children}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
