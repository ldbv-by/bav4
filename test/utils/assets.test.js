import { AssetSourceType, getAssetSource } from '@src/utils/assets';

describe('util-methods for assets', () => {
	describe('getAssetSource', () => {
		it('should detect local asset-source', () => {
			//webpack output
			const localAssetBase64 =
				'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktYXJyb3ctdXAtY2lyY2xlLWZpbGwiIHZpZXdCb3g9IjAgMCAxNiAxNiI+PCEtLU1JVCBMaWNlbnNlLS0+CiAgPHBhdGggZD0iTTE2IDhBOCA4IDAgMSAwIDAgOGE4IDggMCAwIDAgMTYgMHptLTcuNSAzLjVhLjUuNSAwIDAgMS0xIDBWNS43MDdMNS4zNTQgNy44NTRhLjUuNSAwIDEgMS0uNzA4LS43MDhsMy0zYS41LjUgMCAwIDEgLjcwOCAwbDMgM2EuNS41IDAgMCAxLS43MDguNzA4TDguNSA1LjcwN1YxMS41eiIvPgo8L3N2Zz4=';
			//vitest outout
			const localAsset =
				"data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='32'%20height='32'%20fill='%23fff'%20class='bi%20bi-geo-alt-fill'%20viewBox='0%200%2016%2016'%3e%3c!--MIT%20License--%3e%3cpath%20d='M8%2016s6-5.686%206-10A6%206%200%200%200%202%206c0%204.314%206%2010%206%2010m0-7a3%203%200%201%201%200-6%203%203%200%200%201%200%206'/%3e%3c/svg%3";

			expect(getAssetSource(localAssetBase64)).toBe(AssetSourceType.LOCAL);
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
