
import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const initialForm = {
  name: "",
  address: "",
  city: "",
  description: "",
  pricePerNight: "",
  starRating: "3",
  isActive: true,
};

export default function HotelModal({
  show,
  onHide,
  onSubmit,
  saving = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      setForm(initialForm);
      setErrors({});
    }
  }, [show]);

  function handleChange(event) {
    const { name, value, checked, type } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Vui lòng nhập tên khách sạn.";
    }

    if (!form.address.trim()) {
      nextErrors.address = "Vui lòng nhập địa chỉ.";
    }

    if (!form.city.trim()) {
      nextErrors.city = "Vui lòng nhập thành phố.";
    }

    if (
      form.pricePerNight === "" ||
      !Number.isFinite(Number(form.pricePerNight)) ||
      Number(form.pricePerNight) < 0
    ) {
      nextErrors.pricePerNight = "Giá phòng không hợp lệ.";
    }

    if (
      !Number.isInteger(Number(form.starRating)) ||
      Number(form.starRating) < 1 ||
      Number(form.starRating) > 5
    ) {
      nextErrors.starRating = "Số sao phải từ 1 đến 5.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) return;

    await onSubmit({
      ...form,
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      description: form.description.trim(),
      pricePerNight: Number(form.pricePerNight),
      starRating: Number(form.starRating),
    });
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      backdrop={saving ? "static" : true}
      keyboard={!saving}
    >
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Header closeButton={!saving}>
          <Modal.Title>Thêm khách sạn mới</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="row g-3">
            <div className="col-12">
              <Form.Group>
                <Form.Label>
                  Tên khách sạn <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  isInvalid={!!errors.name}
                  placeholder="Ví dụ: Booking Sweet Hotel"
                  maxLength={200}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group>
                <Form.Label>
                  Địa chỉ <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  isInvalid={!!errors.address}
                  placeholder="Số nhà, đường..."
                  maxLength={300}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group>
                <Form.Label>
                  Thành phố <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  isInvalid={!!errors.city}
                  placeholder="Ví dụ: Đà Lạt"
                  maxLength={100}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.city}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Giá mỗi đêm (VNĐ)</Form.Label>
                <Form.Control
                  type="number"
                  name="pricePerNight"
                  min="0"
                  step="1000"
                  value={form.pricePerNight}
                  onChange={handleChange}
                  isInvalid={!!errors.pricePerNight}
                  placeholder="Ví dụ: 800000"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.pricePerNight}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Hạng sao</Form.Label>
                <Form.Select
                  name="starRating"
                  value={form.starRating}
                  onChange={handleChange}
                  isInvalid={!!errors.starRating}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <option key={star} value={star}>
                      {star} sao
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.starRating}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="col-12">
              <Form.Group>
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={2000}
                  placeholder="Giới thiệu về khách sạn, tiện nghi..."
                />
              </Form.Group>
            </div>

            <div className="col-12">
              <Form.Check
                type="switch"
                name="isActive"
                label="Kích hoạt khách sạn"
                checked={form.isActive}
                onChange={handleChange}
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            type="button"
            onClick={onHide}
            disabled={saving}
          >
            Hủy
          </Button>

          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang lưu...
              </>
            ) : (
              "Thêm khách sạn"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

