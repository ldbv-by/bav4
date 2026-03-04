import { AssetSourceType, getAssetSource } from '../../src/utils/assets';

describe('util-methods for assets', () => {
	describe('getAssetSource', () => {
		it('should detect local asset-source', () => {
			const localAsset =
				'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktYXJyb3ctdXAtY2lyY2xlLWZpbGwiIHZpZXdCb3g9IjAgMCAxNiAxNiI+PCEtLU1JVCBMaWNlbnNlLS0+CiAgPHBhdGggZD0iTTE2IDhBOCA4IDAgMSAwIDAgOGE4IDggMCAwIDAgMTYgMHptLTcuNSAzLjVhLjUuNSAwIDAgMS0xIDBWNS43MDdMNS4zNTQgNy44NTRhLjUuNSAwIDEgMS0uNzA4LS43MDhsMy0zYS41LjUgMCAwIDEgLjcwOCAwbDMgM2EuNS41IDAgMCAxLS43MDguNzA4TDguNSA1LjcwN1YxMS41eiIvPgo8L3N2Zz4=';

			expect(getAssetSource(localAsset)).toBe(AssetSourceType.LOCAL);
		});

		it('should detect unknown asset-source', () => {
			const localUnknownAsset =
				'data:image/png;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktYXJyb3ctdXAtY2lyY2xlLWZpbGwiIHZpZXdCb3g9IjAgMCAxNiAxNiI+PCEtLU1JVCBMaWNlbnNlLS0+CiAgPHBhdGggZD0iTTE2IDhBOCA4IDAgMSAwIDAgOGE4IDggMCAwIDAgMTYgMHptLTcuNSAzLjVhLjUuNSAwIDAgMS0xIDBWNS43MDdMNS4zNTQgNy44NTRhLjUuNSAwIDEgMS0uNzA4LS43MDhsMy0zYS41LjUgMCAwIDEgLjcwOCAwbDMgM2EuNS41IDAgMCAxLS43MDguNzA4TDguNSA1LjcwN1YxMS41eiIvPgo8L3N2Zz4=';
			expect(getAssetSource(localUnknownAsset)).toBe(AssetSourceType.UNKNOWN);
			expect(getAssetSource('file://some.url/remote.asset')).toBe(AssetSourceType.UNKNOWN);
			expect(getAssetSource('some')).toBe(AssetSourceType.UNKNOWN);
			expect(getAssetSource(null)).toBe(AssetSourceType.UNKNOWN);
			expect(getAssetSource(undefined)).toBe(AssetSourceType.UNKNOWN);
			expect(getAssetSource()).toBe(AssetSourceType.UNKNOWN);
			expect(getAssetSource('')).toBe(AssetSourceType.UNKNOWN);
		});

		it('should detect remote asset-source', () => {
			expect(getAssetSource('https://some.url/remote.asset')).toBe(AssetSourceType.REMOTE);
			expect(getAssetSource('http://some.url/remote.asset')).toBe(AssetSourceType.REMOTE);
		});
	});
});
