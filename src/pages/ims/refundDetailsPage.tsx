import RefundDetail from "@/components/ims/refundDetails";
import { useAuth } from "@/context/auth-provider";
import type { Refund } from "@/lib/imsTypes";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const RefundDetailsPage = () => {
  const { can } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [refund, setRefund] = useState<Refund | null>(null);
  const [loading, setLoading] = useState(true);

   const canApproveReceivable = can("ims_approve_refund_receivable");
   const canApproveFinal = can("ims_approve_refund_final");
   const canMarkPaid = can("ims_mark_refund_paid");

  useEffect(() => {
    if (!id) return;

    const fetchRefund = async () => {
      try {
        // const data = await getRefundById(id);
        // setRefund(data);
      } finally {
        setLoading(false);
      }
    };

    fetchRefund();
  }, [id]);

  if (loading) return <p>Loading...</p>;

  if (!refund) return <p>Refund not found</p>;

  return (
    <RefundDetail
      refund={refund}
      onBack={() => navigate("/ims/refunds")}
      canApproveReceivable={canApproveReceivable}
      canApproveFinal={canApproveFinal}
      canMarkPaid={canMarkPaid}
    />
  );
};

export default RefundDetailsPage;
