import { useFormik } from 'formik'
import * as Yup from 'yup'

const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

const EXPIRY_RE = /^(0[1-9]|1[0-2])\/\d{2}$/

const schema = Yup.object({
  name: Yup.string().trim().min(3, 'Ingresa el nombre completo del titular').required('El nombre es obligatorio'),
  email: Yup.string().email('Ingresa un correo electrónico válido').required('El correo es obligatorio'),
  card: Yup.string()
    .required('El número de tarjeta es obligatorio')
    .test('len', 'La tarjeta debe tener 16 dígitos', (v) => (v || '').replace(/\s/g, '').length === 16),
  expiry: Yup.string()
    .required('La fecha es obligatoria')
    .matches(EXPIRY_RE, 'Usa el formato MM/AA')
    .test('future', 'La tarjeta está vencida', (v) => {
      if (!v || !EXPIRY_RE.test(v)) return true
      const [m, y] = v.split('/').map(Number)
      return new Date(2000 + y, m, 0, 23, 59, 59) >= new Date()
    }),
  cvv: Yup.string().required('El CVV es obligatorio').matches(/^\d{3,4}$/, 'El CVV tiene 3 o 4 dígitos'),
  terms: Yup.boolean().oneOf([true], 'Debes aceptar los términos para continuar'),
})

function Field({ formik, name, label, children }) {
  const invalid = formik.touched[name] && formik.errors[name]
  const valid = formik.touched[name] && !formik.errors[name]
  return (
    <div className={`field${invalid ? ' invalid' : ''}${valid ? ' valid' : ''}`}>
      <label htmlFor={name}>{label}</label>
      {children}
      <div className="error">{invalid ? formik.errors[name] : ''}</div>
    </div>
  )
}

export default function CheckoutForm({ total, onPay }) {
  const formik = useFormik({
    initialValues: { name: '', email: '', card: '', expiry: '', cvv: '', terms: false },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      // Simulación de pasarela de pago
      await new Promise((r) => setTimeout(r, 1500))
      setSubmitting(false)
      onPay(values)
    },
  })

  const brand = formik.values.card.startsWith('4') ? 'VISA' : /^5[1-5]/.test(formik.values.card) ? 'MASTERCARD' : ''

  return (
    <form className="form" onSubmit={formik.handleSubmit} noValidate>
      <Field formik={formik} name="name" label="Nombre del titular">
        <input id="name" type="text" placeholder="Pamela Rondinel" autoComplete="cc-name" {...formik.getFieldProps('name')} />
      </Field>

      <Field formik={formik} name="email" label="Correo electrónico">
        <input id="email" type="email" placeholder="tucorreo@ejemplo.com" autoComplete="email" {...formik.getFieldProps('email')} />
      </Field>

      <Field formik={formik} name="card" label="Número de tarjeta">
        <div className="input-wrap">
          <input
            id="card" type="text" inputMode="numeric" placeholder="4242 4242 4242 4242" autoComplete="cc-number"
            value={formik.values.card}
            onChange={(e) => formik.setFieldValue('card', formatCard(e.target.value))}
            onBlur={() => formik.setFieldTouched('card', true)}
          />
          {brand && <span className="brand">{brand}</span>}
        </div>
      </Field>

      <div className="row">
        <Field formik={formik} name="expiry" label="Vencimiento (MM/AA)">
          <input
            id="expiry" type="text" inputMode="numeric" placeholder="08/29" autoComplete="cc-exp"
            value={formik.values.expiry}
            onChange={(e) => formik.setFieldValue('expiry', formatExpiry(e.target.value))}
            onBlur={() => formik.setFieldTouched('expiry', true)}
          />
        </Field>
        <Field formik={formik} name="cvv" label="CVV">
          <input
            id="cvv" type="password" inputMode="numeric" placeholder="•••" autoComplete="cc-csc"
            value={formik.values.cvv}
            onChange={(e) => formik.setFieldValue('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
            onBlur={() => formik.setFieldTouched('cvv', true)}
          />
        </Field>
      </div>

      <div>
        <label className="check">
          <input type="checkbox" name="terms" checked={formik.values.terms} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          <span>Acepto los términos y condiciones de SteamLite (compra simulada, no se realiza ningún cargo real).</span>
        </label>
        <div className="error">{formik.touched.terms && formik.errors.terms}</div>
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={formik.isSubmitting}>
        {formik.isSubmitting ? 'Procesando pago…' : `Pagar $${total.toFixed(2)}`}
      </button>
      <p className="hint">🔒 Simulación: usa cualquier número de 16 dígitos, por ejemplo 4242 4242 4242 4242.</p>
    </form>
  )
}
