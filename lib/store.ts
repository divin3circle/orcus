import { create } from "zustand"

type Customer = "merchant" | "customer"

interface CustomerStore {
    customer: Customer
    setCustomer: (customer: Customer) => void
    toggleCustomer: (to: Customer) => void
}

export const useCustomerStore = create<CustomerStore>((set) => ({
    customer: "merchant",
    setCustomer: (customer: Customer) => set({ customer }),
    toggleCustomer: (to: Customer) => set((state) => ({ customer: to })),
}))