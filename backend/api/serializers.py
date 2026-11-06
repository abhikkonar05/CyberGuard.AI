from rest_framework import serializers

class ManualPredictionSerializer(serializers.Serializer):
    DstPort = serializers.IntegerField(required=False, default=443)
    Protocol = serializers.IntegerField(required=False, default=6)
    FlowDuration = serializers.FloatField(required=False, default=100000.0)
    TotFwdPkts = serializers.FloatField(required=False, default=10.0)
    TotBwdPkts = serializers.FloatField(required=False, default=10.0)
    TotLenFwdPkts = serializers.FloatField(required=False, default=1000.0)
    TotLenBwdPkts = serializers.FloatField(required=False, default=1000.0)
    FwdPktLenMax = serializers.FloatField(required=False, default=500.0)
    FwdPktLenMin = serializers.FloatField(required=False, default=0.0)
    FwdPktLenMean = serializers.FloatField(required=False, default=100.0)
    BwdPktLenMax = serializers.FloatField(required=False, default=1000.0)
    BwdPktLenMin = serializers.FloatField(required=False, default=0.0)
    BwdPktLenMean = serializers.FloatField(required=False, default=200.0)
    FlowBytsPerSec = serializers.FloatField(required=False, default=10000.0)
    FlowPktsPerSec = serializers.FloatField(required=False, default=100.0)
    FlowIATMean = serializers.FloatField(required=False, default=5000.0)
    FlowIATStd = serializers.FloatField(required=False, default=2000.0)
    FwdIATTot = serializers.FloatField(required=False, default=90000.0)
    BwdIATTot = serializers.FloatField(required=False, default=90000.0)
    FwdHeaderLen = serializers.FloatField(required=False, default=320.0)
    BwdHeaderLen = serializers.FloatField(required=False, default=320.0)
    SYNFlagCnt = serializers.FloatField(required=False, default=1.0)
    RSTFlagCnt = serializers.FloatField(required=False, default=0.0)
    ACKFlagCnt = serializers.FloatField(required=False, default=10.0)
    DownUpRatio = serializers.FloatField(required=False, default=1.0)
    InitFwdWinByts = serializers.FloatField(required=False, default=29200.0)

class CsvUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        if not value.name.endswith('.csv'):
            raise serializers.ValidationError("Uploaded file must have a .csv extension.")
        if value.size > 50 * 1024 * 1024:  # 50MB limit
            raise serializers.ValidationError("File size exceeds 50MB limit.")
        return value

