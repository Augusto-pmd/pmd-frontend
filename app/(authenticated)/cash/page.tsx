"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { useState } from "react";

export default function CashPage() {
  const [activeTab, setActiveTab] = useState<"cashbox" | "expenses">("cashbox");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Cashbox & Expenses</h1>
          <p className="text-gray-600">Manage cash flow and expenses</p>
        </div>

        <div className="bg-white rounded-lg shadow-pmd">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("cashbox")}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === "cashbox"
                    ? "text-pmd-gold border-b-2 border-pmd-gold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Cashbox
              </button>
              <button
                onClick={() => setActiveTab("expenses")}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === "expenses"
                    ? "text-pmd-gold border-b-2 border-pmd-gold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Expenses
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "cashbox" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-pmd-darkBlue">Cashbox Balance</h2>
                  <button className="px-4 py-2 bg-pmd-darkBlue text-pmd-white rounded-pmd hover:bg-pmd-mediumBlue transition-colors">
                    Add Transaction
                  </button>
                </div>
                <div className="bg-gray-50 rounded-pmd p-6">
                  <p className="text-sm text-gray-600 mb-2">Current Balance</p>
                  <p className="text-3xl font-bold text-pmd-darkBlue">$0.00</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-pmd-darkBlue mb-4">Recent Transactions</h3>
                  <div className="space-y-2">
                    <p className="text-gray-500 text-sm">No transactions yet</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "expenses" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-pmd-darkBlue">Expenses</h2>
                  <button className="px-4 py-2 bg-pmd-darkBlue text-pmd-white rounded-pmd hover:bg-pmd-mediumBlue transition-colors">
                    Add Expense
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-500 text-sm">No expenses recorded</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

