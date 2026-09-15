"use client";

import { useState, useTransition } from "react";
import { Star, Eye, EyeOff, Trash2, MessageSquare } from "lucide-react";
import { toggleReviewPublished, deleteReview } from "@/app/actions/review-actions";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isPublished: boolean;
  createdAt: Date;
  user: { name: string };
}

interface Props {
  reviews: Review[];
}

export function ReviewClient({ reviews: initialReviews }: Props) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (id: string, current: boolean) => {
    startTransition(() => toggleReviewPublished(id, current));
    setReviews(prev => prev.map(r => r.id === id ? { ...r, isPublished: !current } : r));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir esta avaliação definitivamente?")) return;
    startTransition(() => deleteReview(id));
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const publishedCount = reviews.filter(r => r.isPublished).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Star className="text-vitrinia-orange" />
          Avaliações & Prova Social
        </h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie os depoimentos dos clientes e exiba na sua vitrine.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 flex items-center gap-6 shadow-sm">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
            <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Nota Média</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-4xl font-black text-gray-900">{averageRating}</span>
              <span className="text-gray-400 font-medium mb-1">/ 5.0</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Baseado em {reviews.length} avaliações</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-center shadow-sm">
          <div className="flex items-center gap-2 text-vitrinia-purple mb-2">
            <MessageSquare size={18} />
            <span className="font-bold">Vitrine Pública</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Você tem <strong>{publishedCount}</strong> {publishedCount === 1 ? 'avaliação visível' : 'avaliações visíveis'} na sua loja online.
          </p>
          <p className="text-xs text-gray-400 mt-2">Oculte avaliações inapropriadas usando o botão "Olho".</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-40">Nota</th>
                <th className="px-6 py-4">Cliente & Comentário</th>
                <th className="px-6 py-4 text-center">Visibilidade</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">
                    Nenhuma avaliação recebida ainda.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className={cn("hover:bg-gray-50/50 transition", !review.isPublished && "bg-gray-50/30 opacity-70")}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={16} 
                            className={star <= review.rating ? "text-amber-500 fill-amber-500" : "text-gray-200"} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{review.user.name}</div>
                      <div className="text-sm text-gray-600 mt-1 italic">
                        {review.comment ? `"${review.comment}"` : <span className="text-gray-400">(Sem comentário)</span>}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold">
                        {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggle(review.id, review.isPublished)}
                        disabled={isPending}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition",
                          review.isPublished 
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-100" 
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        )}
                      >
                        {review.isPublished ? (
                          <><Eye size={14} /> Pública</>
                        ) : (
                          <><EyeOff size={14} /> Oculta</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(review.id)}
                        disabled={isPending}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition inline-flex disabled:opacity-50"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
