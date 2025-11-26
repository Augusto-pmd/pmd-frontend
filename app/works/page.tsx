"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useWorks, workApi } from "@/hooks/api/works";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { WorkForm } from "@/components/forms/WorkForm";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSWRConfig } from "swr";

function WorksContent() {
  const { works, isLoading, error, mutate } = useWorks();
  const { mutate: globalMutate } = useSWRConfig();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "pending">("all");

  const filteredWorks = works?.filter((work: any) => {
    if (filter === "all") return true;
    return work.status === filter;
  });

  const handleCreate = () => {
    setEditingWork(null);
    setIsModalOpen(true);
  };

  const handleEdit = (work: any) => {
    setEditingWork(work);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this work?")) return;
    setDeleteLoading(id);
    try {
      await workApi.delete(id);
      mutate();
      globalMutate("/works");
    } catch (error: any) {
      alert(error.message || "Failed to delete work");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingWork) {
        await workApi.update(editingWork.id, data);
      } else {
        await workApi.create(data);
      }
      mutate();
      globalMutate("/works");
      setIsModalOpen(false);
      setEditingWork(null);
    } catch (error: any) {
      alert(error.message || "Failed to save work");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Loading works..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error loading works: {error.message || "Unknown error"}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Works – PMD Backend Integration</h1>
            <p className="text-gray-600">Manage projects and work orders</p>
          </div>
          <Button onClick={handleCreate}>+ New Work</Button>
        </div>

        <div className="bg-white rounded-lg shadow-pmd p-6">
          <div className="mb-6 flex gap-2">
            {(["all", "active", "completed", "pending"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-pmd font-medium transition-colors capitalize ${
                  filter === f
                    ? "bg-pmd-darkBlue text-pmd-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-pmd-darkBlue mb-4">Work List</h2>
            {filteredWorks?.length === 0 ? (
              <EmptyState
                title="No works found"
                description="Create your first work order to get started"
                action={<Button onClick={handleCreate}>Create Work</Button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Start Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">End Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Budget</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredWorks?.map((work: any) => (
                      <tr key={work.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{work.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <Badge
                            variant={
                              work.status === "completed"
                                ? "success"
                                : work.status === "active"
                                ? "info"
                                : "warning"
                            }
                          >
                            {work.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {work.startDate ? new Date(work.startDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {work.endDate ? new Date(work.endDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          ${work.budget?.toLocaleString() || "0.00"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(work)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(work.id)}
                              disabled={deleteLoading === work.id}
                            >
                              {deleteLoading === work.id ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingWork(null);
          }}
          title={editingWork ? "Edit Work" : "Create Work"}
          size="lg"
        >
          <WorkForm
            initialData={editingWork}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingWork(null);
            }}
            isLoading={isSubmitting}
          />
        </Modal>
      </div>
    </MainLayout>
  );
}

export default function WorksPage() {
  return (
    <ProtectedRoute>
      <WorksContent />
    </ProtectedRoute>
  );
}
