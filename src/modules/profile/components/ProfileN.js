/* eslint-disable no-console */
import { html } from 'lit-html';
import css from './profile.css';
import { MvuElement } from '../../MvuElement';
import Chart from 'chart.js/auto'; // Todo: Import single dependencies for tree shaking
import { setCoordinates } from '../../../store/example/example.action';

const Update_Chart_Data = 'update_chart_data';

const myData = {
	'heights': [
		{
			'dist': 0.0,
			incline: 5,
			'alts': {
				'COMB': 366.8
			},
			'easting': 4378112.0,
			'northing': 5489920.0
		},
		{
			'dist': 1118.5552,
			incline: 5,
			'alts': {
				'COMB': 354.3
			},
			'easting': 4379069.0,
			'northing': 5489341.0
		},
		{
			'dist': 2237.1104,
			incline: 5,
			'alts': {
				'COMB': 341.8
			},
			'easting': 4380026.0,
			'northing': 5488762.0
		},
		{
			'dist': 3355.6655,
			'alts': {
				'COMB': 370.4
			},
			incline: 20,
			'easting': 4380983.5,
			'northing': 5488183.5
		},
		{
			'dist': 4474.2207,
			'alts': {
				'COMB': 372.3
			},
			incline: 20,
			'easting': 4381940.5,
			'northing': 5487604.5
		},
		{
			'dist': 5592.776,
			'alts': {
				'COMB': 341.0
			},
			incline: 20,
			'easting': 4382897.5,
			'northing': 5487025.5
		},
		{
			'dist': 6711.331,
			'alts': {
				'COMB': 319.9
			},
			incline: 20,
			'easting': 4383854.5,
			'northing': 5486446.5
		},
		{
			'dist': 7829.886,
			'alts': {
				'COMB': 317.1
			},
			'easting': 4384811.5,
			'northing': 5485867.5
		},
		{
			'dist': 8948.441,
			'alts': {
				'COMB': 307.5
			},
			'easting': 4385769.0,
			'northing': 5485289.0
		},
		{
			'dist': 10066.996,
			'alts': {
				'COMB': 317.8
			},
			incline: 20,
			'easting': 4386726.0,
			'northing': 5484710.0
		},
		{
			'dist': 11185.585,
			'alts': {
				'COMB': 325.9
			},
			'easting': 4387683.0,
			'northing': 5484131.0
		},
		{
			'dist': 12304.14,
			'alts': {
				'COMB': 375.9
			},
			'easting': 4388640.0,
			'northing': 5483552.0
		},
		{
			'dist': 13422.694,
			'alts': {
				'COMB': 425.0
			},
			'easting': 4389597.5,
			'northing': 5482973.5
		},
		{
			'dist': 14541.249,
			'alts': {
				'COMB': 408.8
			},
			'easting': 4390554.5,
			'northing': 5482394.5
		},
		{
			'dist': 15659.804,
			'alts': {
				'COMB': 385.7
			},
			'easting': 4391511.5,
			'northing': 5481815.5
		},
		{
			'dist': 16778.36,
			'alts': {
				'COMB': 360.2
			},
			'easting': 4392468.5,
			'northing': 5481236.5
		},
		{
			'dist': 17896.914,
			'alts': {
				'COMB': 367.1
			},
			'easting': 4393425.5,
			'northing': 5480657.5
		},
		{
			'dist': 19015.469,
			'alts': {
				'COMB': 371.6
			},
			'easting': 4394383.0,
			'northing': 5480079.0
		},
		{
			'dist': 20134.023,
			'alts': {
				'COMB': 451.6
			},
			'easting': 4395340.0,
			'northing': 5479500.0
		},
		{
			'dist': 21252.578,
			'alts': {
				'COMB': 424.7
			},
			'easting': 4396297.0,
			'northing': 5478921.0
		},
		{
			'dist': 22371.133,
			'alts': {
				'COMB': 450.6
			},
			'easting': 4397254.0,
			'northing': 5478342.0
		},
		{
			'dist': 23489.688,
			'alts': {
				'COMB': 433.8
			},
			'easting': 4398211.0,
			'northing': 5477763.0
		},
		{
			'dist': 24608.242,
			'alts': {
				'COMB': 425.4
			},
			'easting': 4399168.5,
			'northing': 5477184.5
		},
		{
			'dist': 25726.797,
			'alts': {
				'COMB': 364.9
			},
			'easting': 4400125.5,
			'northing': 5476605.5
		},
		{
			'dist': 26845.352,
			incline: 20,
			'alts': {
				'COMB': 365.5
			},
			'easting': 4401082.5,
			'northing': 5476026.5
		},
		{
			'dist': 27963.906,
			'alts': {
				'COMB': 386.7
			},
			'easting': 4402039.5,
			'northing': 5475447.5
		},
		{
			'dist': 29082.46,
			'alts': {
				'COMB': 353.8
			},
			'easting': 4402996.5,
			'northing': 5474868.5
		},
		{
			'dist': 30201.016,
			'alts': {
				'COMB': 389.9
			},
			'easting': 4403954.0,
			'northing': 5474290.0
		},
		{
			'dist': 31319.605,
			'alts': {
				'COMB': 395.5
			},
			'easting': 4404911.0,
			'northing': 5473711.0
		},
		{
			'dist': 32438.16,
			'alts': {
				'COMB': 385.1
			},
			'easting': 4405868.0,
			'northing': 5473132.0
		},
		{
			'dist': 33556.715,
			incline: 20,
			'alts': {
				'COMB': 343.8
			},
			'easting': 4406825.0,
			'northing': 5472553.0
		},
		{
			'dist': 34675.27,
			incline: 20,
			'alts': {
				'COMB': 398.1
			},
			'easting': 4407782.5,
			'northing': 5471974.5
		},
		{
			'dist': 35793.824,
			incline: 20,
			'alts': {
				'COMB': 368.0
			},
			'easting': 4408739.5,
			'northing': 5471395.5
		},
		{
			'dist': 36912.38,
			incline: 20,
			'alts': {
				'COMB': 387.3
			},
			'easting': 4409696.5,
			'northing': 5470816.5
		},
		{
			'dist': 38030.934,
			incline: 20,
			'alts': {
				'COMB': 382.0
			},
			'easting': 4410653.5,
			'northing': 5470237.5
		},
		{
			'dist': 39149.49,
			'alts': {
				'COMB': 412.0
			},
			'easting': 4411610.5,
			'northing': 5469658.5
		},
		{
			'dist': 40268.043,
			'alts': {
				'COMB': 413.3
			},
			'easting': 4412568.0,
			'northing': 5469080.0
		},
		{
			'dist': 41386.598,
			'alts': {
				'COMB': 405.4
			},
			'easting': 4413525.0,
			'northing': 5468501.0
		},
		{
			'dist': 42505.152,
			'alts': {
				'COMB': 388.6
			},
			'easting': 4414482.0,
			'northing': 5467922.0
		},
		{
			'dist': 43623.707,
			'alts': {
				'COMB': 372.7
			},
			'easting': 4415439.0,
			'northing': 5467343.0
		},
		{
			'dist': 44742.26,
			'alts': {
				'COMB': 364.1
			},
			'easting': 4416396.0,
			'northing': 5466764.0
		},
		{
			'dist': 45860.816,
			'alts': {
				'COMB': 415.4
			},
			'easting': 4417353.5,
			'northing': 5466185.5
		},
		{
			'dist': 46979.37,
			'alts': {
				'COMB': 421.0
			},
			'easting': 4418310.5,
			'northing': 5465606.5
		},
		{
			'dist': 48097.926,
			'alts': {
				'COMB': 430.3
			},
			'easting': 4419267.5,
			'northing': 5465027.5
		},
		{
			'dist': 49216.48,
			'alts': {
				'COMB': 421.6
			},
			'easting': 4420224.5,
			'northing': 5464448.5
		},
		{
			'dist': 50335.035,
			'alts': {
				'COMB': 411.9
			},
			'easting': 4421181.5,
			'northing': 5463869.5
		},
		{
			'dist': 51453.625,
			'alts': {
				'COMB': 406.9
			},
			'easting': 4422139.0,
			'northing': 5463291.0
		},
		{
			'dist': 52572.18,
			'alts': {
				'COMB': 413.9
			},
			'easting': 4423096.0,
			'northing': 5462712.0
		},
		{
			'dist': 53690.734,
			'alts': {
				'COMB': 391.0
			},
			'easting': 4424053.0,
			'northing': 5462133.0
		},
		{
			'dist': 54809.29,
			'alts': {
				'COMB': 379.5
			},
			'easting': 4425010.0,
			'northing': 5461554.0
		},
		{
			'dist': 55927.844,
			'alts': {
				'COMB': 400.8
			},
			'easting': 4425967.5,
			'northing': 5460975.5
		},
		{
			'dist': 57046.4,
			'alts': {
				'COMB': 405.4
			},
			'easting': 4426924.5,
			'northing': 5460396.5
		},
		{
			'dist': 58164.953,
			'alts': {
				'COMB': 364.9
			},
			'easting': 4427881.5,
			'northing': 5459817.5
		},
		{
			'dist': 59283.508,
			'alts': {
				'COMB': 364.9
			},
			'easting': 4428838.5,
			'northing': 5459238.5
		},
		{
			'dist': 60402.062,
			'alts': {
				'COMB': 365.2
			},
			'easting': 4429795.5,
			'northing': 5458659.5
		},
		{
			'dist': 61520.617,
			'alts': {
				'COMB': 370.5
			},
			'easting': 4430753.0,
			'northing': 5458081.0
		},
		{
			'dist': 62639.17,
			'alts': {
				'COMB': 349.0
			},
			'easting': 4431710.0,
			'northing': 5457502.0
		},
		{
			'dist': 63757.727,
			'alts': {
				'COMB': 341.1
			},
			'easting': 4432667.0,
			'northing': 5456923.0
		},
		{
			'dist': 64876.28,
			'alts': {
				'COMB': 337.9
			},
			'easting': 4433624.0,
			'northing': 5456344.0
		},
		{
			'dist': 65994.836,
			'alts': {
				'COMB': 363.2
			},
			'easting': 4434581.0,
			'northing': 5455765.0
		},
		{
			'dist': 67113.39,
			'alts': {
				'COMB': 360.1
			},
			'easting': 4435538.5,
			'northing': 5455186.5
		},
		{
			'dist': 68231.945,
			'alts': {
				'COMB': 357.4
			},
			'easting': 4436495.5,
			'northing': 5454607.5
		},
		{
			'dist': 69350.5,
			'alts': {
				'COMB': 358.9
			},
			'easting': 4437452.5,
			'northing': 5454028.5
		},
		{
			'dist': 70469.055,
			'alts': {
				'COMB': 358.1
			},
			'easting': 4438409.5,
			'northing': 5453449.5
		},
		{
			'dist': 71587.64,
			'alts': {
				'COMB': 362.7
			},
			'easting': 4439367.0,
			'northing': 5452871.0
		},
		{
			'dist': 72706.195,
			'alts': {
				'COMB': 369.3
			},
			'easting': 4440324.0,
			'northing': 5452292.0
		},
		{
			'dist': 73824.75,
			'alts': {
				'COMB': 386.7
			},
			'easting': 4441281.0,
			'northing': 5451713.0
		},
		{
			'dist': 74943.305,
			'alts': {
				'COMB': 381.4
			},
			'easting': 4442238.0,
			'northing': 5451134.0
		},
		{
			'dist': 76061.86,
			'alts': {
				'COMB': 413.4
			},
			'easting': 4443195.0,
			'northing': 5450555.0
		},
		{
			'dist': 77180.414,
			'alts': {
				'COMB': 427.5
			},
			'easting': 4444152.5,
			'northing': 5449976.5
		},
		{
			'dist': 78298.97,
			'alts': {
				'COMB': 453.5
			},
			'easting': 4445109.5,
			'northing': 5449397.5
		},
		{
			'dist': 79417.52,
			'alts': {
				'COMB': 446.9
			},
			'easting': 4446066.5,
			'northing': 5448818.5
		},
		{
			'dist': 80536.08,
			'alts': {
				'COMB': 425.6
			},
			'easting': 4447023.5,
			'northing': 5448239.5
		},
		{
			'dist': 81654.63,
			'alts': {
				'COMB': 415.3
			},
			'easting': 4447980.5,
			'northing': 5447660.5
		},
		{
			'dist': 82773.19,
			'alts': {
				'COMB': 406.9
			},
			'easting': 4448938.0,
			'northing': 5447082.0
		},
		{
			'dist': 83891.74,
			'alts': {
				'COMB': 400.9
			},
			'easting': 4449895.0,
			'northing': 5446503.0
		},
		{
			'dist': 85010.3,
			'alts': {
				'COMB': 398.1
			},
			'easting': 4450852.0,
			'northing': 5445924.0
		},
		{
			'dist': 86128.85,
			'alts': {
				'COMB': 402.1
			},
			'easting': 4451809.0,
			'northing': 5445345.0
		},
		{
			'dist': 87247.41,
			'alts': {
				'COMB': 414.8
			},
			'easting': 4452766.0,
			'northing': 5444766.0
		},
		{
			'dist': 88365.96,
			'alts': {
				'COMB': 432.1
			},
			'easting': 4453723.5,
			'northing': 5444187.5
		},
		{
			'dist': 89484.516,
			'alts': {
				'COMB': 446.5
			},
			'easting': 4454680.5,
			'northing': 5443608.5
		},
		{
			'dist': 90603.07,
			'alts': {
				'COMB': 552.7
			},
			'easting': 4455637.5,
			'northing': 5443029.5
		},
		{
			'dist': 91721.66,
			'alts': {
				'COMB': 534.8
			},
			'easting': 4456594.5,
			'northing': 5442450.5
		},
		{
			'dist': 92840.21,
			'alts': {
				'COMB': 501.1
			},
			'easting': 4457552.0,
			'northing': 5441872.0
		},
		{
			'dist': 93958.766,
			'alts': {
				'COMB': 402.8
			},
			'easting': 4458509.0,
			'northing': 5441293.0
		},
		{
			'dist': 95077.32,
			'alts': {
				'COMB': 383.9
			},
			'easting': 4459466.0,
			'northing': 5440714.0
		},
		{
			'dist': 96195.875,
			'alts': {
				'COMB': 430.3
			},
			'easting': 4460423.0,
			'northing': 5440135.0
		},
		{
			'dist': 97314.43,
			'alts': {
				'COMB': 518.7
			},
			'easting': 4461380.0,
			'northing': 5439556.0
		},
		{
			'dist': 98432.984,
			'alts': {
				'COMB': 509.9
			},
			'easting': 4462337.5,
			'northing': 5438977.5
		},
		{
			'dist': 99551.54,
			'alts': {
				'COMB': 511.7
			},
			'easting': 4463294.5,
			'northing': 5438398.5
		},
		{
			'dist': 100670.09,
			'alts': {
				'COMB': 504.0
			},
			'easting': 4464251.5,
			'northing': 5437819.5
		},
		{
			'dist': 101788.65,
			'alts': {
				'COMB': 491.5
			},
			'easting': 4465208.5,
			'northing': 5437240.5
		},
		{
			'dist': 102907.2,
			'alts': {
				'COMB': 488.6
			},
			'easting': 4466165.5,
			'northing': 5436661.5
		},
		{
			'dist': 104025.76,
			'alts': {
				'COMB': 486.6
			},
			'easting': 4467123.0,
			'northing': 5436083.0
		},
		{
			'dist': 105144.31,
			'alts': {
				'COMB': 491.6
			},
			'easting': 4468080.0,
			'northing': 5435504.0
		},
		{
			'dist': 106262.87,
			'alts': {
				'COMB': 502.6
			},
			'easting': 4469037.0,
			'northing': 5434925.0
		},
		{
			'dist': 107381.42,
			'alts': {
				'COMB': 492.3
			},
			'easting': 4469994.0,
			'northing': 5434346.0
		},
		{
			'dist': 108499.98,
			'alts': {
				'COMB': 443.6
			},
			'easting': 4470951.0,
			'northing': 5433767.0
		},
		{
			'dist': 109618.53,
			'alts': {
				'COMB': 486.6
			},
			'easting': 4471908.5,
			'northing': 5433188.5
		},
		{
			'dist': 110737.086,
			'alts': {
				'COMB': 506.8
			},
			'easting': 4472865.5,
			'northing': 5432609.5
		},
		{
			'dist': 111855.67,
			'alts': {
				'COMB': 510.6
			},
			'easting': 4473822.5,
			'northing': 5432030.5
		},
		{
			'dist': 112974.23,
			'alts': {
				'COMB': 505.7
			},
			'easting': 4474779.5,
			'northing': 5431451.5
		},
		{
			'dist': 114092.78,
			'alts': {
				'COMB': 505.6
			},
			'easting': 4475737.0,
			'northing': 5430873.0
		},
		{
			'dist': 115211.336,
			'alts': {
				'COMB': 505.2
			},
			'easting': 4476694.0,
			'northing': 5430294.0
		},
		{
			'dist': 116329.89,
			'alts': {
				'COMB': 517.2
			},
			'easting': 4477651.0,
			'northing': 5429715.0
		},
		{
			'dist': 117448.445,
			'alts': {
				'COMB': 550.8
			},
			'easting': 4478608.0,
			'northing': 5429136.0
		},
		{
			'dist': 118567.0,
			'alts': {
				'COMB': 508.1
			},
			'easting': 4479565.0,
			'northing': 5428557.0
		},
		{
			'dist': 119685.555,
			'alts': {
				'COMB': 532.5
			},
			'easting': 4480522.5,
			'northing': 5427978.5
		},
		{
			'dist': 120804.11,
			'alts': {
				'COMB': 529.3
			},
			'easting': 4481479.5,
			'northing': 5427399.5
		},
		{
			'dist': 121922.664,
			'alts': {
				'COMB': 492.5
			},
			'easting': 4482436.5,
			'northing': 5426820.5
		},
		{
			'dist': 123041.22,
			'alts': {
				'COMB': 505.1
			},
			'easting': 4483393.5,
			'northing': 5426241.5
		},
		{
			'dist': 124159.77,
			'alts': {
				'COMB': 462.3
			},
			'easting': 4484350.5,
			'northing': 5425662.5
		},
		{
			'dist': 125278.33,
			'alts': {
				'COMB': 517.2
			},
			'easting': 4485308.0,
			'northing': 5425084.0
		},
		{
			'dist': 126396.88,
			'alts': {
				'COMB': 486.6
			},
			'easting': 4486265.0,
			'northing': 5424505.0
		},
		{
			'dist': 127515.44,
			'alts': {
				'COMB': 487.4
			},
			'easting': 4487222.0,
			'northing': 5423926.0
		},
		{
			'dist': 128633.99,
			'alts': {
				'COMB': 450.3
			},
			'easting': 4488179.0,
			'northing': 5423347.0
		},
		{
			'dist': 129752.55,
			'alts': {
				'COMB': 489.7
			},
			'easting': 4489136.0,
			'northing': 5422768.0
		},
		{
			'dist': 130871.1,
			'alts': {
				'COMB': 455.9
			},
			'easting': 4490093.5,
			'northing': 5422189.5
		},
		{
			'dist': 131989.69,
			'alts': {
				'COMB': 469.8
			},
			'easting': 4491050.5,
			'northing': 5421610.5
		},
		{
			'dist': 133108.25,
			'alts': {
				'COMB': 409.9
			},
			'easting': 4492007.5,
			'northing': 5421031.5
		},
		{
			'dist': 134226.81,
			'alts': {
				'COMB': 348.8
			},
			'easting': 4492964.5,
			'northing': 5420452.5
		},
		{
			'dist': 135345.38,
			'alts': {
				'COMB': 340.0
			},
			'easting': 4493922.0,
			'northing': 5419874.0
		},
		{
			'dist': 136463.94,
			'alts': {
				'COMB': 339.0
			},
			'easting': 4494879.0,
			'northing': 5419295.0
		},
		{
			'dist': 137582.5,
			'alts': {
				'COMB': 341.3
			},
			'easting': 4495836.0,
			'northing': 5418716.0
		},
		{
			'dist': 138701.06,
			'alts': {
				'COMB': 412.9
			},
			'easting': 4496793.0,
			'northing': 5418137.0
		},
		{
			'dist': 139819.62,
			'alts': {
				'COMB': 392.4
			},
			'easting': 4497750.0,
			'northing': 5417558.0
		},
		{
			'dist': 140938.19,
			'alts': {
				'COMB': 425.7
			},
			'easting': 4498707.5,
			'northing': 5416979.5
		},
		{
			'dist': 142056.75,
			'alts': {
				'COMB': 399.0
			},
			'easting': 4499664.5,
			'northing': 5416400.5
		},
		{
			'dist': 143175.31,
			'alts': {
				'COMB': 422.9
			},
			'easting': 4500621.5,
			'northing': 5415821.5
		},
		{
			'dist': 144293.88,
			'alts': {
				'COMB': 423.6
			},
			'easting': 4501578.5,
			'northing': 5415242.5
		},
		{
			'dist': 145412.44,
			'alts': {
				'COMB': 427.7
			},
			'easting': 4502535.5,
			'northing': 5414663.5
		},
		{
			'dist': 146531.0,
			'alts': {
				'COMB': 433.5
			},
			'easting': 4503493.0,
			'northing': 5414085.0
		},
		{
			'dist': 147649.56,
			'alts': {
				'COMB': 391.2
			},
			'easting': 4504450.0,
			'northing': 5413506.0
		},
		{
			'dist': 148768.12,
			'alts': {
				'COMB': 407.6
			},
			'easting': 4505407.0,
			'northing': 5412927.0
		},
		{
			'dist': 149886.69,
			'alts': {
				'COMB': 394.6
			},
			'easting': 4506364.0,
			'northing': 5412348.0
		},
		{
			'dist': 151005.25,
			'alts': {
				'COMB': 400.3
			},
			'easting': 4507321.0,
			'northing': 5411769.0
		},
		{
			'dist': 152123.84,
			'alts': {
				'COMB': 373.6
			},
			'easting': 4508278.5,
			'northing': 5411190.5
		},
		{
			'dist': 153242.4,
			'alts': {
				'COMB': 371.1
			},
			'easting': 4509235.5,
			'northing': 5410611.5
		},
		{
			'dist': 154360.97,
			'alts': {
				'COMB': 386.1
			},
			'easting': 4510192.5,
			'northing': 5410032.5
		},
		{
			'dist': 155479.53,
			'alts': {
				'COMB': 400.9
			},
			'easting': 4511149.5,
			'northing': 5409453.5
		},
		{
			'dist': 156598.1,
			'alts': {
				'COMB': 401.5
			},
			'easting': 4512107.0,
			'northing': 5408875.0
		},
		{
			'dist': 157716.66,
			'alts': {
				'COMB': 417.2
			},
			'easting': 4513064.0,
			'northing': 5408296.0
		},
		{
			'dist': 158835.22,
			'alts': {
				'COMB': 417.8
			},
			'easting': 4514021.0,
			'northing': 5407717.0
		},
		{
			'dist': 159953.78,
			'alts': {
				'COMB': 419.0
			},
			'easting': 4514978.0,
			'northing': 5407138.0
		},
		{
			'dist': 161072.34,
			'alts': {
				'COMB': 418.7
			},
			'easting': 4515935.0,
			'northing': 5406559.0
		},
		{
			'dist': 162190.9,
			'alts': {
				'COMB': 451.9
			},
			'easting': 4516892.5,
			'northing': 5405980.5
		},
		{
			'dist': 163309.47,
			'alts': {
				'COMB': 417.6
			},
			'easting': 4517849.5,
			'northing': 5405401.5
		},
		{
			'dist': 164428.03,
			'alts': {
				'COMB': 414.0
			},
			'easting': 4518806.5,
			'northing': 5404822.5
		},
		{
			'dist': 165546.6,
			'alts': {
				'COMB': 375.6
			},
			'easting': 4519763.5,
			'northing': 5404243.5
		},
		{
			'dist': 166665.16,
			'alts': {
				'COMB': 388.9
			},
			'easting': 4520720.5,
			'northing': 5403664.5
		},
		{
			'dist': 167783.72,
			'alts': {
				'COMB': 398.3
			},
			'easting': 4521678.0,
			'northing': 5403086.0
		},
		{
			'dist': 168902.28,
			'alts': {
				'COMB': 407.6
			},
			'easting': 4522635.0,
			'northing': 5402507.0
		},
		{
			'dist': 170020.84,
			'alts': {
				'COMB': 410.7
			},
			'easting': 4523592.0,
			'northing': 5401928.0
		},
		{
			'dist': 171139.4,
			'alts': {
				'COMB': 472.1
			},
			'easting': 4524549.0,
			'northing': 5401349.0
		},
		{
			'dist': 172257.9,
			'alts': {
				'COMB': 431.3
			},
			'easting': 4525506.0,
			'northing': 5400770.5
		},
		{
			'dist': 173376.55,
			'alts': {
				'COMB': 459.8
			},
			'easting': 4526463.5,
			'northing': 5400191.5
		},
		{
			'dist': 174495.11,
			'alts': {
				'COMB': 451.7
			},
			'easting': 4527420.5,
			'northing': 5399612.5
		},
		{
			'dist': 175613.67,
			'alts': {
				'COMB': 464.8
			},
			'easting': 4528377.5,
			'northing': 5399033.5
		},
		{
			'dist': 176732.23,
			'alts': {
				'COMB': 440.5
			},
			'easting': 4529334.5,
			'northing': 5398454.5
		},
		{
			'dist': 177850.8,
			'alts': {
				'COMB': 433.6
			},
			'easting': 4530292.0,
			'northing': 5397876.0
		},
		{
			'dist': 178969.36,
			'alts': {
				'COMB': 393.9
			},
			'easting': 4531249.0,
			'northing': 5397297.0
		},
		{
			'dist': 180087.92,
			'alts': {
				'COMB': 419.4
			},
			'easting': 4532206.0,
			'northing': 5396718.0
		},
		{
			'dist': 181206.48,
			'alts': {
				'COMB': 422.5
			},
			'easting': 4533163.0,
			'northing': 5396139.0
		},
		{
			'dist': 182325.05,
			'alts': {
				'COMB': 449.5
			},
			'easting': 4534120.0,
			'northing': 5395560.0
		},
		{
			'dist': 183443.61,
			'alts': {
				'COMB': 438.4
			},
			'easting': 4535077.5,
			'northing': 5394981.5
		},
		{
			'dist': 184562.17,
			'alts': {
				'COMB': 423.5
			},
			'easting': 4536034.5,
			'northing': 5394402.5
		},
		{
			'dist': 185680.73,
			'alts': {
				'COMB': 408.4
			},
			'easting': 4536991.5,
			'northing': 5393823.5
		},
		{
			'dist': 186799.3,
			'alts': {
				'COMB': 353.7
			},
			'easting': 4537948.5,
			'northing': 5393244.5
		},
		{
			'dist': 187917.86,
			'alts': {
				'COMB': 351.4
			},
			'easting': 4538905.5,
			'northing': 5392665.5
		},
		{
			'dist': 189036.42,
			'alts': {
				'COMB': 350.2
			},
			'easting': 4539863.0,
			'northing': 5392087.0
		},
		{
			'dist': 190154.98,
			'alts': {
				'COMB': 349.2
			},
			'easting': 4540820.0,
			'northing': 5391508.0
		},
		{
			'dist': 191273.55,
			'alts': {
				'COMB': 347.3
			},
			'easting': 4541777.0,
			'northing': 5390929.0
		},
		{
			'dist': 192392.05,
			'alts': {
				'COMB': 347.7
			},
			'easting': 4542734.0,
			'northing': 5390350.0
		},
		{
			'dist': 193510.69,
			'alts': {
				'COMB': 374.0
			},
			'easting': 4543691.5,
			'northing': 5389771.5
		},
		{
			'dist': 194629.25,
			'alts': {
				'COMB': 446.7
			},
			'easting': 4544648.5,
			'northing': 5389192.5
		},
		{
			'dist': 195747.81,
			'alts': {
				'COMB': 408.8
			},
			'easting': 4545605.5,
			'northing': 5388613.5
		},
		{
			'dist': 196866.38,
			'alts': {
				'COMB': 418.0
			},
			'easting': 4546562.5,
			'northing': 5388034.5
		},
		{
			'dist': 197984.94,
			'alts': {
				'COMB': 460.1
			},
			'easting': 4547519.5,
			'northing': 5387455.5
		},
		{
			'dist': 199103.5,
			'alts': {
				'COMB': 430.6
			},
			'easting': 4548477.0,
			'northing': 5386877.0
		},
		{
			'dist': 200222.06,
			'alts': {
				'COMB': 400.0
			},
			'easting': 4549434.0,
			'northing': 5386298.0
		},
		{
			'dist': 201340.62,
			'alts': {
				'COMB': 382.3
			},
			'easting': 4550391.0,
			'northing': 5385719.0
		},
		{
			'dist': 202459.19,
			'alts': {
				'COMB': 382.2
			},
			'easting': 4551348.0,
			'northing': 5385140.0
		},
		{
			'dist': 203577.75,
			'alts': {
				'COMB': 419.7
			},
			'easting': 4552305.0,
			'northing': 5384561.0
		},
		{
			'dist': 204696.31,
			'alts': {
				'COMB': 438.0
			},
			'easting': 4553262.5,
			'northing': 5383982.5
		},
		{
			'dist': 205814.88,
			'alts': {
				'COMB': 447.1
			},
			'easting': 4554219.5,
			'northing': 5383403.5
		},
		{
			'dist': 206933.44,
			'alts': {
				'COMB': 416.9
			},
			'easting': 4555176.5,
			'northing': 5382824.5
		},
		{
			'dist': 208052.0,
			'alts': {
				'COMB': 416.1
			},
			'easting': 4556133.5,
			'northing': 5382245.5
		},
		{
			'dist': 209170.56,
			'alts': {
				'COMB': 401.3
			},
			'easting': 4557090.5,
			'northing': 5381666.5
		},
		{
			'dist': 210289.12,
			incline: 20,
			'alts': {
				'COMB': 412.2
			},
			'easting': 4558048.0,
			'northing': 5381088.0
		},
		{
			'dist': 211407.69,
			incline: 20,
			'alts': {
				'COMB': 410.4
			},
			'easting': 4559005.0,
			'northing': 5380509.0
		},
		{
			'dist': 212526.19,
			incline: 20,
			'alts': {
				'COMB': 385.4
			},
			'easting': 4559962.0,
			'northing': 5379930.0
		},
		{
			'dist': 213644.83,
			incline: 20,
			'alts': {
				'COMB': 408.5
			},
			'easting': 4560919.0,
			'northing': 5379351.0
		},
		{
			'dist': 214763.39,
			incline: 20,
			'alts': {
				'COMB': 446.2
			},
			'easting': 4561876.5,
			'northing': 5378772.5
		},
		{
			'dist': 215881.95,
			'alts': {
				'COMB': 431.3
			},
			'easting': 4562833.5,
			'northing': 5378193.5
		},
		{
			'dist': 217000.52,
			'alts': {
				'COMB': 435.2
			},
			'easting': 4563790.5,
			'northing': 5377614.5
		},
		{
			'dist': 218119.08,
			'alts': {
				'COMB': 440.6
			},
			'easting': 4564747.5,
			'northing': 5377035.5
		},
		{
			'dist': 219237.64,
			'alts': {
				'COMB': 429.7
			},
			'easting': 4565704.5,
			'northing': 5376456.5
		},
		{
			'dist': 220356.2,
			'alts': {
				'COMB': 434.4
			},
			'easting': 4566662.0,
			'northing': 5375878.0
		},
		{
			'dist': 221474.77,
			'alts': {
				'COMB': 429.3
			},
			'easting': 4567619.0,
			'northing': 5375299.0
		},
		{
			'dist': 222593.33,
			'alts': {
				'COMB': 383.7
			},
			'easting': 4568576.0,
			'northing': 5374720.0
		},
		{
			'dist': 222593.33,
			'alts': {
				'COMB': 383.7
			},
			'easting': 4568576.0,
			'northing': 5374720.0
		}
	],
	'sumUp': 1971.6,
	'sumDown': 1954.7
};
let firstTime = true;

const labels = myData.heights.map((height) => height.dist);
const data = myData.heights.map((height) => height.alts.COMB);
const chartData = {
	labels,
	datasets: [{
		data,
		label: 'Profil',
		fill: true,
		borderWidth: 1,
		borderColor: '#66ccff',
		backgroundColor: ((context) => {
			const chart = context.chart;
			const { ctx, chartArea } = chart;

			if (!chartArea) {
				return null;
			}

			if (firstTime) {
				firstTime = false;
				console.log('🚀 ~ file: ProfileN.js ~ line 1640 ~ context', chart);
			}

			return getGradient(ctx, chartArea);
		}),
		tension: 0.1,
		pointRadius: 0,
		spanGaps: true
	}]
};

const hereStartsSteep = 10;
const flatColor = '#66eeff';
const steepColor = '#ee4444';
const InclineType = {
	Flat: 'Flat',
	Steep: 'Steep'
};

const getGradient = (ctx, chartArea) => {
	const gradientBg = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);

	const numberOfPoints = myData.heights.length;
	const xPointWidth = chartArea.width / numberOfPoints;

	// start with 'flat' color
	gradientBg.addColorStop(0, flatColor);
	let currentInclineType = InclineType.Flat;
	// currentInclineType = startFlat(gradientBg, 0, currentInclineType);
	myData.heights.forEach((element, index) => {
		if (currentInclineType === InclineType.Steep) {
			// steep
			// look for first element with incline greater X
			if (!element.incline || element.incline <= hereStartsSteep) {
				const xPoint = xPointWidth / chartArea.width * index ;
				currentInclineType = startFlat(gradientBg, xPoint, currentInclineType);
			}
		}
		else {
			// flat
			// look for first element with incline less than X
			if (element.incline && element.incline > hereStartsSteep) {
				const xPoint = xPointWidth / chartArea.width * index ;
				currentInclineType = startSteep(gradientBg, xPoint, currentInclineType);
			}
		}
	});

	// end with currentInclineType - color
	if (currentInclineType === InclineType.Steep) {
		// steep
		gradientBg.addColorStop(1, steepColor);
	}
	else {
		// flat
		gradientBg.addColorStop(1, flatColor);
	}

	return gradientBg;
};

function startSteep(gradientBg, xPoint) {
	// stop flat color
	gradientBg.addColorStop(xPoint, flatColor);
	// start steep color
	gradientBg.addColorStop(xPoint + 0.00001, steepColor);

	return InclineType.Steep;
}

function startFlat(gradientBg, xPoint) {
	// stop steep color
	gradientBg.addColorStop(xPoint, steepColor);
	// start flat color
	gradientBg.addColorStop(xPoint + 0.00001, flatColor);

	return InclineType.Flat;
}

// const angle = Math.PI / 180;

const parentEventHandler = Chart.prototype._eventHandler;
Chart.prototype._eventHandler = function () { // chart
	// console.log('🚀 ~ file: ProfileN.js ~ line 1629 ~ chart', chart);
	// const {ctx}=chart;

	const ret = parentEventHandler.apply(this, arguments);

	const x = arguments[0].x;
	// const y = arguments[0].y;

	this.clear();
	this.draw();

	// this.ctx.beginPath();
	// this.ctx.fillStyle = 'rgba(255, 26, 104, 0.5)';
	// this.ctx.arc(x, y, 5, 0, angle * 360, false);
	// this.ctx.fill();
	// this.ctx.closePath();

	const yScale = this.scales.y;
	this.ctx.beginPath();
	this.ctx.moveTo(x, yScale.getPixelForValue(yScale.max, 0));
	this.ctx.strokeStyle = '#ff0000';
	this.ctx.lineTo(x, yScale.getPixelForValue(yScale.min, 0));
	this.ctx.stroke();

	// setCoordinates([x, y]);

	return ret;
};

// const lollipopGrid = {
// 	id: 'lollipopGridxx',
// 	beforeDatasetsDraw(chart) {
// 		// console.log('🚀 ~ chart', chart);
// 		const { ctx, scales: { x, y }, chartArea: { top } } = chart;
// 		ctx.save();

// 		// x._gridLineItems.forEach((circle))
// 	}
// };

const config = {
	type: 'line',
	data: chartData,
	plugins: [parentEventHandler, // lollipopGrid,
		{
		// eslint-disable-next-line no-unused-vars
			beforeInit: (chart, args, options) => {
				const maxHeight = Math.max(...chart.data.datasets[0].data);
				chart.options.scales.x.min = Math.min(...chart.data.labels);
				chart.options.scales.x.max = Math.max(...chart.data.labels);
				chart.options.scales.y.max = maxHeight + Math.round(maxHeight * 0.2);
				chart.options.scales.y1.max = maxHeight + Math.round(maxHeight * 0.2);
			}
		}],
	options: {
		label: false,
		responsive: true,
		animation: false,
		maintainAspectRatio: false,
		interaction: { mode: 'x' },

		scales: {
			x: { type: 'linear', grid: {} }, // , grid: { display: false, borderWidth: 0 }
			y: { type: 'linear', beginAtZero: true },
			y1: { type: 'linear', display: true, position: 'right', beginAtZero: true, grid: { drawOnChartArea: false } }
		},

		plugins:
		{
			footer: { align: 'end', display: true, text: 'hier geht was Distance, m / Elevation, m' },
			title: { align: 'end', display: true, text: 'hier geht was Distance, m / Elevation, m' },
			legend: { display: true },
			tooltip: {
				displayColors: false,
				mode: 'index',
				intersect: false,
				callbacks: {
					title: (tooltipItems) => {
						// console.log('🚀 ~ file: ProfileN.js ~ line 1727 ~ tooltipItems', tooltipItems);
						const { parsed } = tooltipItems[0];
						// console.log('🚀 ~ file: ProfileN.js ~ line 1727 ~ parsed', parsed);

						const found = myData.heights.find(element => element.dist === parsed.x);
						if (found) {
							// console.log('🚀 ~ file: ProfileN.js ~ line 1733 ~ found', found.easting);
							setCoordinates([found.easting, found.northing]);
						}

						return 'Distance: ' + tooltipItems[0].label + 'm';
					},
					label: (tooltipItem) => {
						return 'Elevation: ' + tooltipItem.raw + 'm  test test';
					}
					// ,
					// labelPointStyle: function () {
					// 	return {
					// 		pointStyle: 'triangle',
					// 		rotation: 0
					// 	};
					// }
				}
			}
		}

	}
};


/**
 * @author taulinger
 */
export class ProfileN extends MvuElement {

	constructor() {
		super({
			data: [labels, data]
		});
		this._chart = null;
	}

	/**
 * @override
 */
	update(type, data, model) {
		// console.log('🚀 ~ file: ProfileN.js ~ line 79 ~ ProfileN ~ update ~ model', model);
		// console.log('🚀 ~ file: ProfileN.js ~ line 79 ~ ProfileN ~ update ~ data', data);
		switch (type) {
			case Update_Chart_Data:
				return { ...model, data: data };
		}
	}

	/**
 * @override
 */
	onInitialize() {
		// const modelData = myData.heights.map((height) => height.alts.COMB);
		// console.log('🚀 ~ file: ProfileN.js ~ line 92 ~ ProfileN ~ onInitialize ~ modelData', modelData);				// stop flat color


		// setInterval(() => {
		// 	const { labels, data } = this.getModel();
		// 	console.log('🚀🚀 ~ file: ProfileN.js ~ line 99 ~ ProfileN ~ setInterval ~ data', data);
		// 	// const modelDataData = modelData.data;
		// 	// console.log('🚀 ~ file: ProfileN.js ~ line 97 ~ ProfileN ~ setInterval ~ modelDataData', modelDataData);
		// 	// const datasets = modelDataData[0].datasets[0];
		// 	// console.log('🚀 ~ file: ProfileN.js ~ line 99 ~ ProfileN ~ setInterval ~ datasets', datasets);
		// 	const modelData = data.map(() => getRandomInt(1000));
		// 	this.signal(Update_Chart_Data, modelData);

		// }, 1000);
	}

	_createChart() {
		const ctx = this.shadowRoot.querySelector('.profilen').getContext('2d');
		this._chart = new Chart(ctx, config);
	}

	/**
 * @override
 */
	onAfterRender(firsttime) {
		if (firsttime) {
			this._createChart();
		}
	}

	/**
* @override
*/
	// eslint-disable-next-line no-unused-vars
	createView(model) {
		// const data = model.data;
		// console.log('🚀🚀🚀 ~ file: ProfileN.js ~ line 125 ~ ProfileN ~ createView ~ data', data);

		// if (this._chart) {
		// 	console.log('🚀🚀🚀🚀🚀🚀🚀 ~ datasets', this._chart.data.datasets);
		// 	// update data of chart
		// 	// this._chart.data.datasets.forEach((dataset) => {
		// 	// 	dataset.data = data;
		// 	// });
		// 	this._chart.data.datasets[0].data = data;
		// 	this._chart.update();
		// }

		// return html`
		// 	<style>${css}</style>
		// 	<div class="chart-container" style="position: relative; style="width:100%;" >
		// 		<canvas class="profilen" id="route-elevation-chart" ></canvas>
		// 	</div>
		// 	` ;
		return html`
			<style>${css}</style>
			<div class="chart-container" style="position: relative; height:20vh; width:80vh">
				<canvas class="profilen" id="route-elevation-chart" ></canvas>
				sumUp: ${myData.sumUp} sumDown: ${myData.sumDown}
			</div>
			` ;
	}

	static get tag() {
		return 'ba-profile-n';
	}
}
