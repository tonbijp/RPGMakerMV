//========================================
// TF_Undulation.js
// Version :0.4.0.0
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2019
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/**
 * 
 */
/*:ja
 * @plugindesc 階段など高さの違う箇所を自然に歩く
 * @author とんび@鳶嶋工房
 * 
 * 
 * @param TerrainTag
 * @desc この地形タグ+通行設定(4方向)で詳細な段差設定を行う。
 * @type number
 * @min 1
 * @max 7
 * @default 1
 * 
 * 
 * @help
 * 注意 : トリアコンタンさんの HalfMove.js の利用を前提としています。
 * TF_Undulation.js の前に HalfMove.js を配置するようにしてください。
 * 
 * 地形タグと通行設定(4方向)の組み合わせで坂・階段を指定します。
 * 左右(←・→)に入力しておくだけで、自動で上下方向にも移動します。
 * 同じ設定のタイルを敷き詰めると、それっぽく衝突判定を行います。
 * 
 * 1. A5BCDEタイルに地形タグ(デフォルト : 1)を指定
 * 
 * 2. 通行設定(4方向)によって、詳細設定
 *      0x0 ↑→←↓ : 段差レベル1(規定値:6px)
 *      0x1 ↑→←・ : 段差レベル2(規定値:12px)
 *      0x2 ↑→・↓ : \  63°
 *      0x3 ↑→・・ : ＼ 45°
 *      0x4 ↑・←↓ :  / 63°
 *      0x5 ↑・←・ : ／ 45°
 *      0x6 ↑・・↓ : 段差レベル3(規定値:18px)
 *      0x7 ↑・・・ : 段差レベル4(規定値:24px)
 *      0x8 ・→←↓ : 未設定
 *      0x9 ・→←・ : 未設定
 *      0xA ・→・↓ : ＼ 27° A 上より
 *      0xB ・→・・ : ＼ 27° B 下より
 *      0xC ・・←↓ : ／ 27° A 上より
 *      0xD ・・←・ : ／ 27° B 下より
 *      0xE ・・・↓ : 未設定
 *      0xF ・・・・ : 未設定
 * 
 * 利用規約 : MITライセンス
 */
(function(){'use strict';
const PLUGIN_NAME = 'TF_Undulation';
const TERRAIN_TAG = 'TerrainTag';

/*
まずは45だけ作る

地形タグ+方向設定で16バリエーションが出せる。
茂み・梯子・カウンターを加えればさらに複雑な設定が可能。
*/


/**
 * パラメータを受け取る
 */
const pluginParams = PluginManager.parameters( PLUGIN_NAME );


let _TerrainTag = 1;    // 地形タグ規定値

if( pluginParams[ TERRAIN_TAG ] ){
    _TerrainTag = parseInt( pluginParams[ TERRAIN_TAG ], 10 );
} 

// Wは西(左)上がり…＼ 　Eは東(右)上がり…／
const MASK_UNDULATION = 0x001F; // 地形タグ、高層[☆]、通行設定を取り出すマスク
// 段差設定フラグ
const FLAG_BUMP1 = 0x0;
const FLAG_BUMP2 = 0x1;
const FLAG_BUMP3 = 0x6;
const FLAG_BUMP4 = 0x7;
// 傾き設定フラグ
const FLAG_W45 = 0x3;
const FLAG_E45 = 0x5;
const FLAG_W63 = 0x2;
const FLAG_E63 = 0x4;
const FLAG_W27A = 0xA;
const FLAG_W27B = 0xB;
const FLAG_E27A = 0xC;
const FLAG_E27B = 0xD;


// フラグから移動速度の調整比率を得る
const FLAG2RATIO_W = {}; // 西(左)向き←
FLAG2RATIO_W[ FLAG_W45 ] = [ 0.2, 0.2 ]; // ↖︎
FLAG2RATIO_W[ FLAG_E45 ] = [ 0.2, -0.2 ]; // ↙︎
FLAG2RATIO_W[ FLAG_W63 ] = [ 0.6, 0.2 ]; // ↖︎
FLAG2RATIO_W[ FLAG_E63 ] = [ 0.6, -0.2 ]; //  ↙︎
FLAG2RATIO_W[ FLAG_W27A ] = [ 0.2, 0.6 ]; // ↖︎
FLAG2RATIO_W[ FLAG_E27A ] = [ 0.2, -0.6 ]; // ↙︎
FLAG2RATIO_W[ FLAG_W27B ] = [ 0.2, 0.6 ]; // ↖︎
FLAG2RATIO_W[ FLAG_E27B ] = [ 0.2, -0.6 ]; // ↙︎
const FLAG2RATIO_E = {}; // 東(右)向き→
FLAG2RATIO_E[ FLAG_W45 ] = [ -0.2, -0.2 ]; // ↘︎
FLAG2RATIO_E[ FLAG_E45 ] = [ -0.2, 0.2 ]; // ↗︎
FLAG2RATIO_E[ FLAG_W63 ] = [ -0.6, -0.2 ]; // ↘︎
FLAG2RATIO_E[ FLAG_E63 ] = [ -0.6, 0.2 ]; // ↗︎
FLAG2RATIO_E[ FLAG_W27A ] = [ -0.2, -0.6 ]; // ↘︎
FLAG2RATIO_E[ FLAG_E27A ] = [ -0.2, 0.6 ]; // ↗︎
FLAG2RATIO_E[ FLAG_W27B ] = [ -0.2, -0.6 ]; // ↘︎
FLAG2RATIO_E[ FLAG_E27B ] = [ -0.2, 0.6 ]; // ↗︎

// フラグから階段(坂)の到達点の位置を得る
const FLAG2POS_W= {}; // 西(左)向き←
FLAG2POS_W[ FLAG_W45 ] = [ 0, -0.5];
FLAG2POS_W[ FLAG_E45 ] = [ 0, 0.5];
FLAG2POS_W[ FLAG_W63 ] = [ 0, -1];
FLAG2POS_W[ FLAG_E63 ] = [ 0, 1];
FLAG2POS_W[ FLAG_W27A ] = [ -0.5, -0.5];
FLAG2POS_W[ FLAG_E27A ] = [ -0.5, 0.5];
FLAG2POS_W[ FLAG_W27B ] = [ -0.5, -0.5];
FLAG2POS_W[ FLAG_E27B ] = [ -0.5, 0.5];
const FLAG2POS_E= {}; // 東(右)向き→
FLAG2POS_E[ FLAG_W45 ] = [ 0, 0.5];
FLAG2POS_E[ FLAG_E45 ] = [ 0, -0.5];
FLAG2POS_E[ FLAG_W63 ] = [ 0, 1];
FLAG2POS_E[ FLAG_E63 ] = [ 0, -1];
FLAG2POS_E[ FLAG_W27A ] = [ 0.5, 0.5];
FLAG2POS_E[ FLAG_E27A ] = [ 0.5, -0.5];
FLAG2POS_E[ FLAG_W27B ] = [ 0.5, 0.5];
FLAG2POS_E[ FLAG_E27B ] = [ 0.5, -0.5];


/*---- Game_CharacterBase ----*/
/**
 * 指定方向への移動が可能か
 * キャラクタ半分の位置が関係するものは、ここで判定。
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} d 向き(テンキー対応)
 * @returns {Boolean} 移動可能か
 */
const _Game_CharacterBase_isMapPassable = Game_CharacterBase.prototype.isMapPassable;
Game_CharacterBase.prototype.isMapPassable = function( x, y, d ){
    const intX = Math.floor( x + 0.5 );
    const intY = Math.floor( y + 0.5 );
    const isJustX = ( this._realX % 1 ) === 0;
    const isJustY =  ( this._realY % 1 ) === 0;

    // 高低差タイプ
    const undulationType = getUndulationType( intX, intY );             // 現在地
    const undulationTypeE = getUndulationType( intX + 1, intY );   // 東→
    const undulationTypeW = getUndulationType( intX - 1,  intY ); // 西←
    const undulationTypeS = getUndulationType( intX, intY + 1 );   // 南↓
    const undulationTypeN = getUndulationType( intX, intY - 1 );   // 北↑

    const isNorthTile = undulationType !== undulationTypeN;
    const isSouthTile = undulationType !== undulationTypeS;
    const isNorthTileW = undulationTypeW !== getUndulationType( intX - 1, intY - 1 );
    const isSouthTileW = undulationTypeW !== getUndulationType( intX - 1, intY + 1 );
    
    const isSameVerticalTile = ( dy )=>{
        return undulationType === getUndulationType( intX, intY + dy );
    };
    const isSameVerticalTileW = ( dy )=>{
        return undulationTypeW === getUndulationType( intX - 1, intY + dy );
    };
    const isSameVerticalW27ABTile = ( dy )=>{
        const targetUndulationType = getUndulationType( intX, intY + dy );
        return ( undulationType === FLAG_W27A ||  undulationType === FLAG_W27B )
            && ( targetUndulationType === FLAG_W27A ||  targetUndulationType === FLAG_W27B );
    };
    const isSameVerticalE27ABTile = ( dy )=>{
        const targetUndulationType = getUndulationType( intX, intY + dy );
        return ( undulationType === FLAG_E27A ||  undulationType === FLAG_E27B )
            && ( targetUndulationType === FLAG_E27A ||  targetUndulationType === FLAG_E27B );
    };



    // ＼ FLAG_W27A
    const isW27Tile = ( undulationType )=>{
        return undulationType === FLAG_W27A ||  undulationType === FLAG_W27B
    };
    
    if( undulationType === FLAG_W27A 
        && !isJustX && !isJustY && d === 8 && !isSameVerticalW27ABTile( -1 )
    ) return false;
    if( undulationTypeE === FLAG_W27A && isJustX && d === 6 ){
            const undulationTypeNE = getUndulationType( intX + 1, intY - 1 );
            if( !isW27Tile( undulationTypeNE ) ) return true;
    }
    if( undulationTypeW === FLAG_W27A ){
        const undulationTypeNW = getUndulationType( intX - 1, intY - 1 );
        const undulationTypeSW = getUndulationType( intX - 1, intY + 1 );
        if( isJustX ){
            if( isJustY && d === 4 && !isW27Tile( undulationTypeSW ) ) return false;
        }else if( isJustY ){
            if( d === 8 && !isW27Tile( undulationTypeNW ) ) return false;
        }else{
            if( d === 8 ){
                if( !isW27Tile( undulationTypeSW ) ) return true;
            }else if( d === 2 ){
                if( !isW27Tile( undulationTypeNW ) ) return false;
                if( !isW27Tile( undulationTypeSW ) ) return false;
            }
        }
    }
    if( undulationTypeS === FLAG_W27A && isJustY && d === 2 && !isW27Tile( undulationType ) ) return false;
    if( !isJustX && !isJustY && d === 8
        && !isW27Tile( undulationTypeW )
        && getUndulationType( intX - 1, intY - 1 ) === FLAG_W27A
    ) return false;
    if( isW27Tile( undulationType )
        && !isJustX && isJustY && d === 2 && undulationTypeS === FLAG_W27A
        && !isSameVerticalW27ABTile( 2 )
    ) return false;
    if( isW27Tile( undulationTypeW )
        && !isJustX && isJustY && d === 2
        && getUndulationType( intX - 1, intY + 1 ) === FLAG_W27A
    ){
        const undulationTypeS2W = getUndulationType( intX - 1, intY + 2 );
        if( !isW27Tile( undulationTypeS2W ) ) return true;
    }

    // ／ FLAG_E27A
    const isE27Tile = ( undulationType )=>{
        return undulationType === FLAG_E27A ||  undulationType === FLAG_E27B
    };
    if( undulationType === FLAG_E27A ){
    }

    // FLAG_W27A・FLAG_E27Aの下部タイル
    if( d === 8 && !isJustY ){
        if( undulationTypeN === FLAG_W27A && undulationType !== FLAG_W27A && undulationType !== FLAG_W27B ) return false;
        if( undulationTypeN === FLAG_E27A && undulationType !== FLAG_E27A && undulationType !== FLAG_E27B ) return false;
    }



    // ＼ FLAG_W27B
    if( undulationType === FLAG_W27B ){
        if( isJustX ){
            if( !isJustY && d === 2 && !isSameVerticalW27ABTile( -1 ) ) return false;
        }else{
            if( isJustY ){
                if( d === 8 &&  !isSameVerticalW27ABTile( -1 ) ) return false;
            }else if( d === 2 ){
                if( !isSameVerticalW27ABTile( 1 ) || !isSameVerticalW27ABTile( -1 ) ) return false;
            }else if( d === 8 && !isSameVerticalW27ABTile( 1 ) ) return true;
        }
    }else if( undulationTypeE === FLAG_W27B ){
        if( isJustX && !isJustY && d === 6 && getUndulationType( intX + 1, intY + 1 ) !== FLAG_W27B ) return true;
    }else if( undulationTypeW === FLAG_W27B ){
        if( !isJustX ){
            if( isJustY ){
                if( d === 2 && ( !isSameVerticalTileW( -1 ) || !isSameVerticalTileW( 1 ) ) )return false;
            }else if( d === 8 && isSameVerticalTileW( -1 ) && !isSameVerticalTileW( -2 ) ) return false;
            if( d === 2 || d === 8 ) return true;
        }
    }

    // ／ FLAG_E27B
    if( undulationType === FLAG_E27B ){
        if( isJustX ){
            if( !isJustY && d === 2 && !isSameVerticalE27ABTile( -1 ) ) return false;
        }else{
            if( isJustY ){
                if( d === 2 && ( !isSameVerticalE27ABTile( -1 ) || !isSameVerticalE27ABTile( 1 ) ) ) return false;
            }else if( d === 8 && isSameVerticalE27ABTile( -1 ) && !isSameVerticalE27ABTile( -2 ) ) return false;
            if( d === 8 ) return true;
        }
    }else if( undulationTypeW === FLAG_E27B ){
        if( isJustX ){
            if( !isJustY && d === 4 && !isSameVerticalTileW( 1 ) ) return true;
        }else if( isJustY ){
            if( d === 2 ) return true;
            if( d === 8 &&  !isSameVerticalTileW( -1 ) ) return false;
        }else if( d === 2 ){
            if( !isSameVerticalTileW( -1 ) || !isSameVerticalTileW( 1 ) ) return false;
        }else if( d === 8 && !isSameVerticalTileW( 1 ) ) return true;
    }

    // \  FLAG_W63
    if( undulationType === FLAG_W63 ){
        if( isJustX ){
            if( isJustY ){
                if( d === 2 && !isSouthTile ) return false;
            }else if( d === 2 || d === 4 ){
                if( !isNorthTile ) return false;
            }else if( d === 8 && isNorthTile && !isSameVerticalTile( -2 ) ) return false;
            if( d === 4 ) return true;
        }else if( !isJustY && d === 8 && !isNorthTile ) return false;
    }else if( isJustX ){
        if( !isJustY && d === 8
            && undulationTypeN === FLAG_W63
            && !isNorthTile
        ) return false;
    }else if( isJustY ){
        if( d === 4 ){
            if( undulationTypeW === FLAG_W63  && !isSameVerticalTileW( - 1 )
            ) return false;
        }else if( d === 2 && undulationTypeS === FLAG_W63 && !isSouthTile ) return false;
    }
    
    // FLAG_W27A・FLAG_W27B・FLAG_E27A・FLAG_E27B 共通の中央部分タイル
    if( d === 2 || d === 8 ){
        if( isSameVerticalW27ABTile( 1 ) && isSameVerticalW27ABTile( -1 ) ) return true;
        if( isSameVerticalE27ABTile( 1 ) && isSameVerticalE27ABTile( -1 ) ) return true;
    }



    //  / FLAG_E63
    if( undulationType === FLAG_E63 ){
        if( isJustX ){
            if( isJustY ){
                if( d === 2 && !isSouthTile ) return false;
            }else if( d === 2 || d === 6 ){
                if( !isNorthTile ) return false;
            }else if( d === 8 && isNorthTile && !isSameVerticalTile( -2 ) ) return false;
            if( d === 6 ) return true;
        }else if( isJustY && d === 6 && !isNorthTile ) return false;
    }else if( isJustX ){
        if( !isJustY && d === 8
            && undulationTypeN === FLAG_E63
            && !isNorthTile
        ) return false;
    }
    if( !isJustX ){ // FLAG_E63に乗っている時も使うので else でつなげていない
        if( isJustY ){
            if( d === 2
                && undulationTypeW !== FLAG_E63
                && isSameVerticalTileW( intX - 1, intY + 1 ) === FLAG_E63
            ) return false;
        }else if( d === 8 ){
            if( undulationTypeW === FLAG_E63 ){
                if( !isSameVerticalTileW( - 1 ) ) return false;
            }else if( getUndulationType( intX - 1, intY - 1 ) === FLAG_E63 ) return false;
        }
    }

    // ＼ FLAG_W45
    if( undulationType === FLAG_W45 ){
        if( isJustX ){
            if( isJustY ){
                if( d === 8 && !isNorthTile ) return false;
            }else if( d === 2 ){
                if( !isSouthTile || !isNorthTile ) return false;
            }else if( ( d === 8 || d === 4 ) && isNorthTile ) return true;
        }else if( isJustY ){
            if( d === 2 && isSouthTile ) return  isSameVerticalTile( 2 );
        }else if( d === 8 && !isNorthTile ) return false;
    }else if( !isJustX ){
        if( isJustY ){
            if( d === 2 ){
                if( undulationTypeS === FLAG_W45 ) return false;
                if( undulationTypeW === FLAG_W45 && !isSameVerticalTileW( - 1 ) ) return false;
            }
        }else if( undulationTypeW === FLAG_W45 && !isJustY && d === 8
            && isSameVerticalTileW( - 1 ) && !isSameVerticalTileW( - 2 ) ) return false;
    }

    // ／ FLAG_E45
    if( undulationType === FLAG_E45 ){
        if( isJustX ){
            if( isJustY ){
                if( d === 8 && !isNorthTile ) return false;
            }else if( d === 2 ){
                if( !isSouthTile || !isNorthTile ) return false;
            }else if( ( d === 8 ||  d === 6 ) && isNorthTile ) return true;
        }else if( isJustY ){
            if( d === 2 ) return isNorthTile && isSouthTile;
        }else if( d === 8 && isNorthTile ) return isSameVerticalTile( - 2 );
    }else if( undulationTypeW === FLAG_E45 && !isJustX && d === 8 && !isSameVerticalTileW( - 1 ) ){
        if( isSameVerticalTileW( 1 ) ){
            if( !isJustY ) return false;
        }else{
            if(  isJustY ) return false;
        }
    }

    return _Game_CharacterBase_isMapPassable.apply( this, arguments );
}

/**
 * 移動から停止・停止から移動に切り替わったタイミングを調べる。
 */
const _Game_CharacterBase_updateMove = Game_CharacterBase.prototype.updateMove;
Game_CharacterBase.prototype.updateMove = function() {
    if( this.chaseCharacter ) { // followerは除外
        _Game_CharacterBase_updateMove.call( this );
        return;
    }

    const preRealX = this._realX;
    const tileX = ( preRealX + 0.5 ) % 1;
    const isW =  this.x < preRealX;
    if( this._realX != this.x ){ //移動中
        const undulationType = getUndulationType( Math.floor( this._realX + 0.5 ), Math.floor( this._realY + 0.5 ) );
        if( undulationType !== -1 ){

            const ratioXY = isW ? FLAG2RATIO_W[ undulationType ] : FLAG2RATIO_E[ undulationType ];
            if( ratioXY && !( ( undulationType === FLAG_W63 && 0.5 < tileX ) || ( undulationType === FLAG_E63 && tileX < 0.5 ) ) ){
                this._realX += this.distancePerFrame() * ratioXY[ 0 ];
                this._realY += this.distancePerFrame() * ratioXY[ 1 ];
            }
        }
    }

    _Game_CharacterBase_updateMove.call( this );
    if( preRealX === this.x || this._realX === this.x ) return;
 
    const undulationType = getUndulationType( Math.floor( this._realX + 0.5 ), Math.floor( this._realY + 0.5 ) );
    if( undulationType === -1 || ( preRealX * 2 ) !== Math.floor( preRealX * 2 ) ) return;

    const targetPos = isW ? FLAG2POS_W[ undulationType ] : FLAG2POS_E[ undulationType ];
    if( targetPos === undefined ) return;

    // 角度63の坂は半分だけ動かす
    if( undulationType === FLAG_W63 ){
        if( isW ){
            if( tileX === 0 ) return;
        } else {
            if( tileX === 0.5 ) return;
        }
    }else if( undulationType === FLAG_E63 ){
        if( isW ){
            if( tileX === 0.5 ) return;
        } else {
            if( tileX === 0 ) return;
        }
    }

    //動き始め
    this._x = $gameMap.roundX( this._x + targetPos[ 0 ] );
    //this._realX -= targetPos[ 0 ];
    this._y = $gameMap.roundY( this._y + targetPos[ 1 ] );
    this._realY = this._y - targetPos[ 1 ];
}


 // フラグから段差の量を得る
 const FLAG2BUMP= {};
 FLAG2BUMP[ FLAG_BUMP1 ] = 6;
 FLAG2BUMP[ FLAG_BUMP2 ] = 12;
 FLAG2BUMP[ FLAG_BUMP3 ] = 18;
 FLAG2BUMP[ FLAG_BUMP4 ] = 24;

/**
 * 縦にずらすピクセル数を返す
 */
const _Game_CharacterBase_shiftY = Game_CharacterBase.prototype.shiftY;
Game_CharacterBase.prototype.shiftY = function(){
    const shiftY = _Game_CharacterBase_shiftY.call( this );
    let tileX = ( this._realX + 0.5 ) % 1;
    const intX = Math.floor( this._realX + 0.5 );
    const intY = Math.floor( this._realY + 0.5 );
    const undulationTypeL = ( tileX === 0 )? getUndulationType( intX - 1, intY ) : -1;
    const undulationTypeR = getUndulationType( intX, intY );
    if( -1 === undulationTypeL && -1 === undulationTypeR ) return shiftY;

    /**
     * 段差指定フラグに応じた段差を返す
     * @param {Number} undulationType 段差指定フラグ
     * @returns {Number} 段差(ピクセル)
     */
    const getBump = ( undulationType )=>{
        if( undulationType === -1 ) return 0;
        const bump = FLAG2BUMP[ undulationType ];
        if( bump ) return bump;
        return 0;
    }

    const dYR = getBump( undulationTypeR );
    const dYL = getBump( undulationTypeL );
    return shiftY + Math.max( dYL, dYR );
}


/*---- Game_Player ----*/
/**
 * 階段の上の場合、4方向移動に固定
 * @param {Number} d 向き(テンキー対応)
 */
var _Game_Player_executeMove = Game_Player.prototype.executeMove;
Game_Player.prototype.executeMove = function( d ) {
    const tmpD = [ 0, 4, 2, 6, 4, 5, 6, 4, 8, 6 ][ d ];
    const targetX =  ( tmpD === 6 ) ? $gameMap.roundX( this.x + 0.5 ) : this.x ;

    if( FLAG2RATIO_W[ getUndulationType( targetX , this.y ) ] || FLAG2RATIO_W[ getUndulationType( targetX , $gameMap.roundY( this.y + 0.5 ) ) ]  ){
        this.moveStraight( tmpD );
    }else{
        _Game_Player_executeMove.apply( this, arguments );
    }
}

/*---- Game_Map ----*/
/**
 * 指定位置の指定方向が通行可か。
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} d 向き(テンキー対応)
 * @returns {Boolean} 
 */
const _Game_Map_isPassable = Game_Map.prototype.isPassable;
Game_Map.prototype.isPassable = function( x, y, d ){
    if( this.terrainTag( x, y ) !== _TerrainTag ) return  _Game_Map_isPassable.apply( this, arguments );

    const undulationType = getUndulationType( x, y );
    // 高低差判定がある場合は全方向通行可
    if( FLAG2BUMP[ undulationType ] ) return true;

    const undulationTypeS = getUndulationType( x, y + 1 );
    // 下が同じタイルで繋がっている場合は通行可
    if( FLAG2RATIO_W[ undulationType ] ){
        if( undulationType === undulationTypeS
            // FLAG_W27A・FLAG_W27B および FLAG_E27B・FLAG_E27Aは同じとみなす
            || ( undulationType === FLAG_W27A && undulationTypeS === FLAG_W27B )
            || ( undulationType === FLAG_W27B && undulationTypeS === FLAG_W27A )
            || ( undulationType === FLAG_E27A && undulationTypeS === FLAG_E27B )
            || ( undulationType === FLAG_E27B && undulationTypeS === FLAG_E27A )
        ) return true;
    }

    return _Game_Map_isPassable.apply( this, arguments );
};



/*---- ユーティリティ関数 ----*/
/**
 * 指定位置に高低差flagがあれば返す
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} undulationType 調べるタイルのflag
 * @returns {Boolean} 見つかったflag、見つからない場合は-1
 */
function getUndulationType( x, y ){
    x = Math.floor( $gameMap.roundX( x ) );
    y = Math.floor( $gameMap.roundY( y ) );
    const flags = $gameMap.tilesetFlags();
    const tiles = $gameMap.allTiles( x, y );
    
    for ( let i = 0; i < tiles.length; i++ ){
        const flag = flags[ tiles[ i ] ];
        if ( ( flag  >> 12 ) === _TerrainTag ) return flag & MASK_UNDULATION;
    }    
    return -1;
}
})();
