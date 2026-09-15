import { ReviewClient } from "./ReviewClient";
import { getReviews } from "@/app/actions/review-actions";

export default async function AvaliacoesPage() {
  const reviews = await getReviews();

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <ReviewClient reviews={reviews as any} />
    </div>
  );
}
