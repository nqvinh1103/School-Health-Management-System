import { EditOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import axios from "axios";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";

const { Title, Text } = Typography;
const { TextArea } = Input;

const validationSchema = Yup.object().shape({
  studentId: Yup.string().required("Vui lòng chọn học sinh"),
  medicationName: Yup.string().required("Vui lòng nhập tên thuốc"),
  dosage: Yup.string().required("Vui lòng nhập liều lượng"),
  frequency: Yup.string().required("Vui lòng nhập tần suất sử dụng"),
  instructions: Yup.string().required("Vui lòng nhập hướng dẫn sử dụng"),
  startDate: Yup.date().required("Vui lòng chọn ngày bắt đầu"),
  endDate: Yup.date().required("Vui lòng chọn ngày kết thúc"),
  description: Yup.string(),
  unit: Yup.string(),
  stockQuantity: Yup.number()
    .typeError("Vui lòng nhập số lượng")
    .min(1, "Số lượng phải lớn hơn 0")
    .required("Vui lòng nhập số lượng"),
});

const statusColor = {
  PENDING_APPROVAL: "orange",
  APPROVED: "green",
  REJECTED: "red",
};
const statusLabel = {
  PENDING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

const MedicineInfo = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentMedicines, setStudentMedicines] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentMedicines(selectedStudent);
    }
  }, [selectedStudent]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/parents/my-children", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        console.log(response.data.data);
        setChildren(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedStudent(response.data.data[0].studentId);
        }
      }
    } catch (error) {
      console.error("Error fetching children:", error);
      message.error("Không thể lấy danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentMedicines = async (studentId) => {
    setLoadingMedicines(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/parents/students/${studentId}/medicines`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setStudentMedicines(response.data.data || []);
      } else {
        setStudentMedicines([]);
      }
    } catch {
      setStudentMedicines([]);
    } finally {
      setLoadingMedicines(false);
    }
  };

  const handleStudentChange = (studentId) => {
    setSelectedStudent(studentId);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/parents/request-medication/${values.studentId}`,
        {
          medicationName: values.medicationName,
          dosage: values.dosage,
          frequency: values.frequency,
          instructions: values.instructions,
          startDate: values.startDate ? values.startDate.toISOString() : null,
          endDate: values.endDate ? values.endDate.toISOString() : null,
          description: values.description,
          unit: values.unit,
          stockQuantity: values.stockQuantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        message.success("Gửi thông tin thuốc thành công");
        resetForm();
        setIsEditModalVisible(false);
        setShowSuccess(true);
        fetchStudentMedicines(selectedStudent);
      } else {
        message.error(response.data.error || "Có lỗi xảy ra khi gửi thông tin");
      }
    } catch (error) {
      console.error("Error submitting medication:", error);
      message.error(
        error.response?.data?.error || "Có lỗi xảy ra khi gửi thông tin"
      );
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f6fcfa]">
        <div className="w-full max-w-5xl mx-auto px-4">
          <div style={{ padding: "24px", textAlign: "center" }}>
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f6fcfa]">
      <div className="w-full max-w-5xl mx-auto px-4">
        <Card
          className="w-full rounded-3xl shadow-lg border-0 mt-12"
          style={{
            background: "#fff",
            borderRadius: "1.5rem",
            boxShadow: "0px 3px 16px rgba(0,0,0,0.10)",
            padding: "2rem",
            marginTop: "3rem",
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              marginBottom: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <Title level={2} className="!text-[#36ae9a] !mb-0">
                Thông tin thuốc
              </Title>
              <Text type="secondary">Quản lý thông tin thuốc của học sinh</Text>
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              {children && children.length > 0 ? (
                <Select
                  style={{ width: 200 }}
                  value={selectedStudent}
                  onChange={handleStudentChange}
                  placeholder="Chọn học sinh"
                >
                  {children.map((child) => (
                    <Select.Option
                      key={child.studentId}
                      value={child.studentId}
                    >
                      {child.fullName}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <Text type="secondary">Không có học sinh nào</Text>
              )}
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditModalVisible(true)}
                disabled={!selectedStudent}
              >
                Thêm thuốc mới
              </Button>
            </div>
          </div>

          {showSuccess && (
            <Alert
              message="Thông tin thuốc đã được gửi thành công!"
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Table
            dataSource={studentMedicines}
            loading={loadingMedicines}
            columns={[
              {
                title: "Tên thuốc",
                dataIndex: ["medication", "name"],
                key: "medicationName",
                render: (text, record) => record.medication?.name || "",
              },
              {
                title: "Liều lượng",
                dataIndex: "dosage",
                key: "dosage",
              },
              {
                title: "Tần suất",
                dataIndex: "frequency",
                key: "frequency",
              },
              {
                title: "Hướng dẫn",
                dataIndex: "instructions",
                key: "instructions",
              },
              {
                title: "Ngày bắt đầu",
                dataIndex: "startDate",
                key: "startDate",
                render: (date) =>
                  date ? new Date(date).toLocaleDateString("vi-VN") : "",
              },
              {
                title: "Ngày kết thúc",
                dataIndex: "endDate",
                key: "endDate",
                render: (date) =>
                  date ? new Date(date).toLocaleDateString("vi-VN") : "",
              },
              {
                title: "Trạng thái",
                dataIndex: "status",
                key: "status",
                render: (status) => (
                  <Tag color={statusColor[status]}>
                    {statusLabel[status] || status}
                  </Tag>
                ),
              },
            ]}
            rowKey="id"
            pagination={false}
            style={{ marginTop: 24 }}
          />

          <Modal
            title="Thêm thuốc mới"
            open={isEditModalVisible}
            onCancel={() => setIsEditModalVisible(false)}
            footer={null}
            width={800}
          >
            <Formik
              initialValues={{
                studentId: selectedStudent,
                medicationName: "",
                dosage: "",
                frequency: "",
                instructions: "",
                startDate: null,
                endDate: null,
                description: "",
                unit: "",
                stockQuantity: 1,
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
                setFieldValue,
              }) => (
                <Form layout="vertical" onFinish={handleSubmit}>
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Tên thuốc"
                        validateStatus={
                          touched.medicationName && errors.medicationName
                            ? "error"
                            : ""
                        }
                        help={touched.medicationName && errors.medicationName}
                      >
                        <Input
                          name="medicationName"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.medicationName}
                          placeholder="Nhập tên thuốc"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Liều lượng"
                        validateStatus={
                          touched.dosage && errors.dosage ? "error" : ""
                        }
                        help={touched.dosage && errors.dosage}
                      >
                        <Input
                          name="dosage"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.dosage}
                          placeholder="Ví dụ: 1 viên/lần"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Tần suất sử dụng"
                        validateStatus={
                          touched.frequency && errors.frequency ? "error" : ""
                        }
                        help={touched.frequency && errors.frequency}
                      >
                        <Select
                          name="frequency"
                          onChange={(value) =>
                            setFieldValue("frequency", value)
                          }
                          onBlur={handleBlur}
                          value={values.frequency}
                          placeholder="Chọn tần suất"
                        >
                          <Select.Option value="once">1 lần/ngày</Select.Option>
                          <Select.Option value="twice">
                            2 lần/ngày
                          </Select.Option>
                          <Select.Option value="three">
                            3 lần/ngày
                          </Select.Option>
                          <Select.Option value="four">4 lần/ngày</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Mô tả"
                        validateStatus={
                          touched.description && errors.description
                            ? "error"
                            : ""
                        }
                        help={touched.description && errors.description}
                      >
                        <Input
                          name="description"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.description}
                          placeholder="Nhập mô tả thuốc"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Đơn vị"
                        validateStatus={
                          touched.unit && errors.unit ? "error" : ""
                        }
                        help={touched.unit && errors.unit}
                      >
                        <Input
                          name="unit"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.unit}
                          placeholder="Ví dụ: viên, ml, mg"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Số lượng"
                        validateStatus={
                          touched.stockQuantity && errors.stockQuantity
                            ? "error"
                            : ""
                        }
                        help={touched.stockQuantity && errors.stockQuantity}
                      >
                        <Input
                          name="stockQuantity"
                          type="number"
                          min={1}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.stockQuantity}
                          placeholder="Nhập số lượng"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Thời gian sử dụng"
                        validateStatus={
                          (touched.startDate && errors.startDate) ||
                          (touched.endDate && errors.endDate)
                            ? "error"
                            : ""
                        }
                        help={
                          (touched.startDate && errors.startDate) ||
                          (touched.endDate && errors.endDate)
                        }
                      >
                        <Space>
                          <DatePicker
                            placeholder="Ngày bắt đầu"
                            onChange={(date) =>
                              setFieldValue("startDate", date)
                            }
                            value={values.startDate}
                          />
                          <span>-</span>
                          <DatePicker
                            placeholder="Ngày kết thúc"
                            onChange={(date) => setFieldValue("endDate", date)}
                            value={values.endDate}
                          />
                        </Space>
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item
                        label="Hướng dẫn sử dụng"
                        validateStatus={
                          touched.instructions && errors.instructions
                            ? "error"
                            : ""
                        }
                        help={touched.instructions && errors.instructions}
                      >
                        <TextArea
                          name="instructions"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.instructions}
                          placeholder="Nhập hướng dẫn sử dụng chi tiết"
                          rows={4}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: 24,
                      }}
                    >
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSubmitting}
                      >
                        Gửi thông tin
                      </Button>
                    </div>
                  </Form.Item>
                </Form>
              )}
            </Formik>
          </Modal>
        </Card>
      </div>
    </div>
  );
};

export default MedicineInfo;
