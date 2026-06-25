import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ShippingCalculator({ orderTotal = 0, onResult }) {
  const [city, setCity] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState(['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan', 'Safi', 'El Jadida', 'Beni Mellal', 'Nador', 'Taza', 'Settat', 'Mohammedia', 'Khouribga', 'Youssoufia', 'Laayoune']);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!city) return toast.error('Please select a city');
    setLoading(true);
    try {
      const res = await axios.post('/api/shipping/calculate', { city, orderTotal: Number(orderTotal) });
      setResult(res.data);
      if (onResult) onResult(res.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Calculation failed'); }
    setLoading(false);
  };

  return (
    <div className="card-solid p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-moris-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1m4-1l2 1 2-1m-8 4h8a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2z" /></svg>
        Shipping Calculator
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select value={city} onChange={e => setCity(e.target.value)} className="input-field" required>
          <option value="">Select city</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Weight (kg) - optional" className="input-field" />
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Calculating...' : 'Calculate Shipping'}</button>
      </form>
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-700/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Shipping Cost</span>
            <span className="text-2xl font-bold text-emerald-500">{result.cost} DH</span>
          </div>
          {result.estimatedDays && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Estimated Delivery</span>
              <span className="font-semibold">{result.estimatedDays} days</span>
            </div>
          )}
          {result.freeShipping && <p className="text-xs text-emerald-600 mt-2">Free shipping eligible!</p>}
        </motion.div>
      )}
    </div>
  );
}
