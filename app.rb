require 'sinatra'
require 'sinatra/cross_origin'
require 'logger'
require 'net/http'

configure do
  logger = Logger.new('sinatra.log')
  enable :cross_origin
end

get '/' do
  public "rakuten.html"
end

post '/search' do
  uri = "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20140222"
  res = Net::HTTP.post_form((URI.parse uri),
    { :'applicationId'=> ENV["applicationId"],
     :'affiliateId'=> "0641f941.17ca8956.0641f942.e1c0fb28",
     :'keyword'=> params["keyword"],
     :'imageFlg'=> params["imageFlg"],
     :'availability'=> params["availability"],
     :'sort'=> params["sort"],
     :'pointRateFlag'=> params["pointRateFlag"],
     :'pointRate'=> params["pointRate"],
     :'creditCardFlag'=> params["creditCardFlag"],
     :'page'=> params["page"]
    }
  )
  #logger.info res.body
  return res.body
end

def public(view)
  File.read(File.join('public', view))
end
