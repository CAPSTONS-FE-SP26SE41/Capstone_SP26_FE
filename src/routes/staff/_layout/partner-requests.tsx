import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState, useCallback } from "react"
import { Check, X, ExternalLink, ShieldAlert, FileText, Eye, Info } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { HubConnectionBuilder } from "@microsoft/signalr"
import {
  getPendingPartnerRequests,
  reviewPartnerRequest,
  type PartnerRequestResponse
} from "../../../services/partnerRequestService"

export const Route = createFileRoute("/staff/_layout/partner-requests")({
  component: PartnerRequestsPage,
})

function PartnerRequestsPage() {
  const [requests, setRequests] = useState<PartnerRequestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Review Modal states
  const [selectedRequest, setSelectedRequest] = useState<PartnerRequestResponse | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isApproved, setIsApproved] = useState(true)
  const [adminNote, setAdminNote] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // License Preview Modal states
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)

  // Toast notifications
  const [toast, setToast] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchRequests = useCallback(async (showLoading: boolean = true) => {
    if (showLoading) setLoading(true)
    try {
      const data = await getPendingPartnerRequests(page, pageSize)
      setRequests(data.items || [])
      setTotalPages(Math.max(1, data.totalPages || 1))
      setTotalItems(data.totalItems || 0)
    } catch (error: any) {
      console.error("Fetch pending requests error", error)
      showToast("error", "Không thể tải danh sách yêu cầu đăng ký đối tác.")
      setRequests([])
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    void fetchRequests()
  }, [fetchRequests])

  useEffect(() => {
    const token = localStorage.getItem("manager_token") || localStorage.getItem("admin_token")
    if (token) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5246/api"
      const hubUrl = baseUrl.replace("/api", "") + "/hubs/notification"
      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl, { accessTokenFactory: () => token })
        .withAutomaticReconnect()
        .build()

      connection.on("ReceiveNotification", (notification: any) => {
        if (
          notification?.Type === "PARTNER_REQUEST_CREATED" || notification?.type === "PARTNER_REQUEST_CREATED" ||
          notification?.Type === "PARTNER_REQUEST_REVIEWED" || notification?.type === "PARTNER_REQUEST_REVIEWED"
        ) {
          // Tự động tải lại danh sách chờ duyệt thời gian thực mà không cần reload trang
          void fetchRequests(false)

          if (notification?.Type === "PARTNER_REQUEST_CREATED" || notification?.type === "PARTNER_REQUEST_CREATED") {
            const reqName = notification?.Request?.businessName || notification?.request?.businessName || "đối tác mới"
            showToast("success", `Có một yêu cầu đối tác mới từ: ${reqName}`)
          }
        }
      })

      connection.start().catch((err) => console.error("SignalR Staff Partner Request Error: ", err))

      return () => {
        void connection.stop()
      }
    }
  }, [fetchRequests])

  const handleOpenReviewModal = (req: PartnerRequestResponse, approved: boolean) => {
    setSelectedRequest(req)
    setIsApproved(approved)
    setAdminNote("")
    setIsReviewModalOpen(true)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return

    setSubmitting(true)
    try {
      await reviewPartnerRequest(selectedRequest.id, {
        isApproved,
        adminNote: adminNote.trim(),
      })

      showToast(
        "success",
        isApproved
          ? `Đã duyệt thành công đối tác: ${selectedRequest.businessName}`
          : `Đã từ chối yêu cầu của: ${selectedRequest.businessName}`
      )

      setIsReviewModalOpen(false)
      setSelectedRequest(null)
      // Refresh list
      void fetchRequests()
    } catch (error: any) {
      console.error("Submit review error", error)
      showToast("error", error?.message || "Xét duyệt thất bại. Vui lòng thử lại.")
    } finally {
      setSubmitting(false)
    }
  }

  const isImageLink = (url: string) => {
    if (!url) return false
    return /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(url.split("?")[0])
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden mt-2">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-800">Danh sách yêu cầu chờ duyệt</h2>
            <span className="text-sm text-slate-500 font-medium bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              {totalItems} Yêu cầu
            </span>
          </div>
          <button
            onClick={() => void fetchRequests()}
            className="inline-flex items-center justify-center h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors shadow-sm"
          >
            Làm mới
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-medium">Đang tải danh sách yêu cầu đăng ký...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 border border-dashed border-slate-300">
              <ShieldAlert size={28} />
            </div>
            <p className="font-semibold text-slate-700 text-lg">Không có yêu cầu chờ duyệt</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3.5 text-xs uppercase text-slate-500 font-bold tracking-wider w-[22%]">Doanh nghiệp</th>
                    <th className="px-6 py-3.5 text-xs uppercase text-slate-500 font-bold tracking-wider w-[20%]">Tài khoản</th>
                    <th className="px-6 py-3.5 text-xs uppercase text-slate-500 font-bold tracking-wider w-[18%]">Thông tin liên hệ</th>
                    <th className="px-6 py-3.5 text-xs uppercase text-slate-500 font-bold tracking-wider w-[15%]">Địa chỉ doanh nghiệp</th>
                    <th className="px-6 py-3.5 text-xs uppercase text-slate-500 font-bold tracking-wider w-[12%]">Giấy phép</th>
                    <th className="px-6 py-3.5 text-xs uppercase text-slate-500 font-bold tracking-wider text-right w-[13%]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Business info */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-sm leading-tight">{req.businessName}</div>
                        <div className="text-xs text-slate-400 mt-1">Gửi: {new Date(req.createdAt).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</div>
                      </td>

                      {/* Account Info */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700 text-sm truncate" title={req.accountName}>{req.accountName}</div>
                        <div className="text-xs text-slate-500 truncate mt-0.5" title={req.accountEmail}>{req.accountEmail}</div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="font-medium">{req.businessPhone || "—"}</div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate" title={req.businessEmail}>{req.businessEmail || "—"}</div>
                      </td>

                      {/* Business Address */}
                      <td className="px-6 py-4 text-sm text-slate-600 truncate" title={req.businessAddress}>
                        {req.businessAddress || "—"}
                      </td>

                      {/* License */}
                      <td className="px-6 py-4 text-sm">
                        {req.businessLicenseUrl ? (
                          isImageLink(req.businessLicenseUrl) ? (
                            <button
                              onClick={() => setPreviewImageUrl(req.businessLicenseUrl)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors"
                            >
                              <Eye size={14} />
                              Xem ảnh GP
                            </button>
                          ) : (
                            <a
                              href={req.businessLicenseUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                            >
                              <FileText size={14} />
                              Tài liệu GP <ExternalLink size={12} />
                            </a>
                          )
                        ) : (
                          <span className="text-slate-400">Không có</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenReviewModal(req, true)}
                            className="group relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors shadow-sm"
                          >
                            <Check size={16} />
                            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-[90]">
                              Phê duyệt
                              <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                            </span>
                          </button>
                          <button
                            onClick={() => handleOpenReviewModal(req, false)}
                            className="group relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm"
                          >
                            <X size={16} />
                            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm whitespace-nowrap z-[90]">
                              Từ chối
                              <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800"></span>
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between flex-shrink-0">
              <span className="text-sm text-slate-500 font-medium">
                Trang <span className="font-semibold text-slate-800">{page}</span> trên <span className="font-semibold text-slate-800">{totalPages}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-9 px-4 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
                >
                  Trước
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-9 px-4 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
                >
                  Tiếp
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsReviewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={(e) => void handleReviewSubmit(e)}>
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    {isApproved ? (
                      <span className="text-emerald-600">Phê duyệt đối tác</span>
                    ) : (
                      <span className="text-rose-600">Từ chối đối tác</span>
                    )}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3 text-sm text-slate-600">
                    <Info size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      Bạn đang chuẩn bị {isApproved ? "duyệt" : "từ chối"} hồ sơ của doanh nghiệp{" "}
                      <span className="font-bold text-slate-800">{selectedRequest.businessName}</span>.
                      {isApproved && " Tài khoản đại diện sẽ được cấp quyền đối tác (Partner) ngay lập tức."}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Ghi chú phản hồi {isApproved ? "(Không bắt buộc)" : "(Bắt buộc)"}
                    </label>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      required={!isApproved}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-slate-400"
                      placeholder={
                        isApproved
                          ? "Nhập lời chào mừng hoặc ghi chú duyệt đối tác..."
                          : "Vui lòng nhập lý do cụ thể từ chối hồ sơ đối tác (bắt buộc)..."
                      }
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="h-10 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`h-10 px-6 rounded-xl text-sm font-bold text-white transition-all shadow-md ${
                      isApproved
                        ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                        : "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                    } disabled:opacity-50`}
                  >
                    {submitting ? "Đang xử lý..." : isApproved ? "Xác nhận Duyệt" : "Xác nhận Từ chối"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* License Preview Modal */}
      <AnimatePresence>
        {previewImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setPreviewImageUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-2 rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setPreviewImageUrl(null)}
                className="absolute top-4 right-4 z-50 p-2 bg-slate-900/60 hover:bg-slate-900/80 rounded-full text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex-1 overflow-auto rounded-xl">
                <img
                  src={previewImageUrl}
                  alt="Giấy phép kinh doanh"
                  className="max-w-full max-h-[85vh] object-contain rounded-xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-[9999] px-4 py-3 rounded-xl shadow-lg border transition-all animate-bounce ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
