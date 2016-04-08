 /**
  * 残作業
  * 1.ハッシュにパラメータを持たせてブラウザの戻る・進むボタンに対応させる
  *   ->対応済み。ただし、モダンブラウザのみ。
  *     iOS4.3やらAndroid4でも動かないので、IEと同様ハッシュチェンジによる仕組みを
  *     別途作ったほうがいいかも(場合わけして)
  *
  **/
  $(function(){
    var keyword="";
    var url;
    var items;
    var sort;
    var point=0;
    var pointRateFlag;
    var pointRate;
    var creditCardFlag;
    var page=1;
    var tax;
    
    
    /* ハッシュは止めたよ
      $(window).hashchange( function(){
      $('#fade').fadeIn();
      page = location.hash.split("#")[1];
      search();
    });*/
    
    /* 代わりにpopState,pushState使っちゃうよ */
    window.onpopstate = function(event){ //戻る/進むでイベント発動
		  if (event) {
				var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
				if(hashes[0]==location.href){return false;}
				else{
				  $('#fade').fadeIn('500');
					keyword=decodeURI(hashes[0]);
					sort=hashes[1];
					pointRateFlag=hashes[2];
					pointRate=hashes[3];
					creditCardFlag=hashes[4];
					page=parseInt(hashes[5],10);
					search();
				}
		  }
    }
    
    $('#send').click(function() {
      if(setParam()){
        $('#fade').fadeIn();
        search();
        window.history.pushState(null, null, 'rakuten.html?'+keyword+'&'+sort+'&'+pointRateFlag+'&'+pointRate+'&'+creditCardFlag+'&'+page);
      }
      else{
        return false;
      }
    });
    
    $(document).on('click','.pageNum,.next,.prev',function() {
      $('#fade').fadeIn('500');
      if($(this).is('.next')){
        page = parseInt(page+1,10);        
      }
      else if($(this).is('.prev')){
        page = parseInt(page-1,10);
      }
      else {
        page = parseInt($(this).text(),10);
      }
      window.history.pushState(null, null, 'rakuten.html?'+keyword+'&'+sort+'&'+pointRateFlag+'&'+pointRate+'&'+creditCardFlag+'&'+page);
      var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
      keyword=decodeURI(hashes[0]);
      sort=hashes[1];
      pointRateFlag=hashes[2];
      pointRate=hashes[3];
      creditCardFlag=hashes[4];
      page=parseInt(hashes[5],10);
      search();
    });
    
    
    // マウスが乗ったとき・はなれたときの処理
    $(document).on({
      'mouseenter': function() {
        $(this).css({'cursor':'pointer','background':'#DDD','text-decoration':'none'});
      },
      'mouseleave': function() {
        $(this).css({'cursor':'auto','background':'#FFF','text-decoration':'underline'});
      }
    },'.pageNum,.next,.prev');
    

    // 打鍵を監視(Enterキーが押されたら検索実行)
    $('.keyword,.pointRate').keydown(function(e){
      if($.browser.msie && $.browser.version < 9) { // なぜかIE8では打鍵監視の必要がない。うーん。
      }else{
	    if (e.which == 13){
	      if(setParam()){
	        $('#fade').fadeIn();
	        search();
	        window.history.pushState(null, null, 'rakuten.html?'+keyword+'&'+sort+'&'+pointRateFlag+'&'+pointRate+'&'+creditCardFlag+'&'+page);
	      }
	      else{
	        return false;
	      }
	    }
	  }
    });
    
    function setParam(){
      //ポイントをリセット
      point =0;
      //検索条件をセット
      sort = $('.sort').val();
      pointRate = $('.pointRate').val();
      point = parseInt($('.rakutenFlg:checked').val());
      // 土曜日ならポイントを2倍にする(実質3倍)
      var Dt = new Date();
      if(point==1 &&Dt.getDay()==6){
        point=point + 1;
      }
      if(pointRate ==""){
        pointRateFlag=0;
      }else if(pointRate.match(/^[0-9]*$/) && 1< parseInt(pointRate,10) && parseInt(pointRate,10)<11){
      	pointRateFlag=1;
      }else{
      	alert('ポイント倍数に整数以外が入力されているか、2～10以上の数値が入力されているようです');
		return false;
	  }
      creditCardFlag = $('.creditCardFlag:checked').val();
      keyword =  $('.keyword').val();
      if(keyword==""){
      	alert('検索キーワードを入力してください');
      	return false;
      }

	  /* キーワード文字の判別(半角英数か漢字か、ひらがなその他か)と、エラーチェック。
	   * 基本1文字検索はエラー処理。でもなぜか漢字1文字は検索OKなので、そのパターンのみ例外化している。
	   */
      var keywords = keyword.split(/\s/);
      for (var i in keywords) {
        var unicode = keywords[i].charCodeAt(0);
        if(keywords[i].length<=1 && (keywords[i].match(/^[a-zA-Z0-9]+$/))){
          alert('検索キーワードは2文字以上です(複数キーワード時も同様)');
      	  return false;
        }
        else if(keywords[i].length<=1 && ((i.match( /[^0-9A-Za-z\s.-]+/ ))||(unicode>=0xff61 && unicode<=0xff9f) || ( unicode>=0x30a0 && unicode<=0x30ff ) || ( unicode>=0x3040 && unicode<=0x309f ))){
          alert('検索キーワードは2文字以上です(複数キーワード時も同様)');
      	  return false;
      	}
      }
      page=1;
      return true;
    }

    function search(){
      $('#items').html(''); // 検索結果クリア
      $('#page').html('');
      
      //url = "http://rakutensearch-bon10.rhcloud.com/search";
      url = "http://bon.moe.hm:4567/search";
      $.post(url,
      	 {'keyword':keyword,'imageFlg':1,
      	  'availability':1,'sort':sort,'pointRateFlag':pointRateFlag,'pointRate':pointRate,'creditCardFlag':creditCardFlag,
      	  'page':page}, 
        function (data){
          items = $.parseJSON(data);
          // 処理自体上手く言ってない場合は、警告をだしつつ終了
          if(data == null || data.Items == null){
            $('#items').append('<strong style="color:#ff0000">上手く検索が行えなかったようです。時間を置いて再度検索してみてください。</strong>');
            $('#fade').fadeOut();
            return;
          }
          // 検索総数
          $('#items').append('検索結果：'+ data.count +'件');
          // $('#page').append('ページ数：'+data.value.items[0].page+'/ '+data.value.items[0].pageCount );
          
          // 検索結果が0件の場合は処理終了
          if(data.count == 0 ){
            $('#fade').fadeOut();
            return;
          }
        
          $.each(data.Items, function(i,item){
        
            // 税込み有無フラグから文字列生成
            if(item.Item.taxFlag==0){
              tax='(税込)';
            }else{
            	tax='(税別)';
            }
          
            // 商品名
            $('<p>').attr('class','title').appendTo('#items')
            .html($('<a>').attr({'href':item.Item.affiliateUrl,'target':'_blank'}).append(item.Item.itemName));
          
            // 商品画像
            // サムネイル化された画像の幅を400pxにしてみる。replace使えば余裕か… 2013/2
            if(item.Item.imageFlag ==1){
				      if(item.Item.mediumImageUrls[0]!=null){
                var itemImgUrl = item.Item.mediumImageUrls[0].imageUrl;
                }else{
                  var itemImgUrl = item.Item.mediumImageUrls.imageUrl;
                }
                itemImgUrl = itemImgUrl.replace("128x128","400x400");
                $('<div>').attr('class','image').appendTo('#items')
                .html($('<a>').attr({'href':item.Item.affiliateUrl,'target':'_blank'})
                .append($('<img/>').attr('src', itemImgUrl)));
            }else{
              $('<div>').attr('class','image').appendTo('#items')
              .html($('<a>').attr({'href':item.Item.affiliateUrl,'target':'_blank'})
              .append($('<img/>').attr('src', './noImage.gif')));
            }
          
            // ポイント計算
            var _point = parseInt(item.Item.pointRate+point,10); // カード利用の場合pointが1(例 1倍ポイント+カードポイント1倍=実質2倍)
            var pt = parseInt(item.Item.itemPrice*_point/100,10);
            var sagaku = parseInt(item.Item.itemPrice-pt,10);
            var _price;
            _price = '値段：'+item.Item.itemPrice+'円'+tax+' ポイント適用後->'+sagaku+'円';

            // テキスト部
            // 値段、ポイント、説明、口コミ数などを追加
            $('<div>').attr('class','text')
            .append($('<div>').attr('class','price').text(_price))
            .append($('<div>').attr('class','point').text('ポイント： '+_point+'倍(獲得ポイント'+pt+'Pt)'))
            //.append($('<div>').attr('class','discription').text('説明： '+item.Item.itemCaption))
            .append($('<div>').attr('class','review').text('口コミ件数： '+item.Item.reviewCount))
            .append('評価平均： '+item.Item.reviewAverage+'点')
            .appendTo('#items');
          
            // 回りこみ解除
            $('<div>').attr('style','clear:both;').appendTo('#items');
            
            // 区切り線
            $('<hr />').appendTo('#items');
          });
        
          // ページ生成
          var count = 10*Math.round(data.page/10-0.5);
          if(data.page!=1){
            $('#page').append('<span class="prev">前の30件</a>');
          }
          for(var i=count; i< count+11 ; i++){
            if(i<=data.pageCount && i== data.page){
          	  $('#page').append('<span class="current">'+i+'</span>');
          	}
          	else if(i<=data.pageCount && i>0){
              $('#page').append('<span class="pageNum">'+i+'</a>');
          	}
          }
          if(data.page < data.pageCount){
            $('#page').append('<span class="next">次の30件</a>');
          }
        
          $('#fade').fadeOut();
        },'json');
      }
    
      // topに戻るボタンを作る
      var topBtn = $('.page-top');
      topBtn.hide();
    
      //スクロールが100に達したらボタン表示
      $(window).on().scroll(function () {
      if ($(this).scrollTop() > 100) {
        topBtn.fadeIn();
      } else {
        topBtn.fadeOut();
      }
    });
    
    
	  //スクロールしてトップ
    topBtn.click(function () {
		  $('body,html').animate({
			  scrollTop: 0
		  }, 500);
		  return false;
    });
    
    $('.detail').hover(
      function(){
	      $(this).css({'cursor':'pointer','text-decoration':'underline','color':'#CCC'});
	    },
	    function(){
	      $(this).css({'text-decoration':'none','color':'#000'});
	    }
	  );
	
	  $('.detail').on('click',function(){
	    $('.search2').slideToggle();
	  });
  });
  
