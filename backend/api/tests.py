from django.test import SimpleTestCase
from django.urls import reverse
import io

class CyberGuardApiTests(SimpleTestCase):
    """
    Unit tests for CyberGuard REST APIs.
    Uses SimpleTestCase because no database is configured.
    """

    def test_health_check(self):
        url = reverse('api-health')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get('status'), 'healthy')
        self.assertEqual(data.get('model_status'), 'loaded')

    def test_dashboard_stats(self):
        url = reverse('api-dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('total_traffic', data)
        self.assertIn('attack_percentage', data)
        self.assertIn('attack_distribution', data)

    def test_manual_prediction_benign(self):
        url = reverse('api-predict-manual')
        payload = {
            "DstPort": 443,
            "Protocol": 6,
            "FlowDuration": 120540,
            "TotFwdPkts": 12,
            "TotBwdPkts": 14,
            "TotLenFwdPkts": 820,
            "TotLenBwdPkts": 14200
        }
        response = self.client.post(url, payload, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get('status'), 'Normal')
        self.assertIn('Benign', data.get('category'))
        self.assertGreater(data.get('confidence'), 0.90)

    def test_manual_prediction_ddos(self):
        url = reverse('api-predict-manual')
        payload = {
            "DstPort": 80,
            "Protocol": 6,
            "FlowDuration": 2840,
            "TotFwdPkts": 85,
            "TotBwdPkts": 0,
            "TotLenFwdPkts": 24500,
            "TotLenBwdPkts": 0
        }
        response = self.client.post(url, payload, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get('status'), 'Attack')
        self.assertEqual(data.get('category'), 'DDoS Attack')

    def test_csv_upload_prediction(self):
        url = reverse('api-predict-csv')
        csv_data = (
            "DstPort,Protocol,FlowDuration,TotFwdPkts,TotBwdPkts,TotLenFwdPkts\n"
            "443,6,120540,12,14,820\n"
            "80,6,2840,85,0,24500\n"
        )
        file = io.BytesIO(csv_data.encode('utf-8'))
        file.name = "test_traffic.csv"

        response = self.client.post(url, {'file': file}, format='multipart')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get('status'), 'success')
        self.assertEqual(data.get('total_rows'), 2)
        self.assertEqual(data.get('normal_detected'), 1)
        self.assertEqual(data.get('attacks_detected'), 1)

    def test_predictions_history(self):
        url = reverse('api-predictions-history')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('predictions', data)
        self.assertGreaterEqual(len(data['predictions']), 1)

    def test_model_info_and_metrics(self):
        info_res = self.client.get(reverse('api-model-info'))
        self.assertEqual(info_res.status_code, 200)
        self.assertEqual(info_res.json().get('features_count'), 26)

        metrics_res = self.client.get(reverse('api-model-metrics'))
        self.assertEqual(metrics_res.status_code, 200)
        self.assertIn('accuracy', metrics_res.json())

